from __future__ import annotations

import asyncio
import uuid
from typing import Any

import chess.engine
from anthropic import AsyncAnthropic
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

import chess as chess_pkg
from app.auth.models import User
from app.chess.models import (
    ChessCoachSession,
    ChessGame,
    ChessLearningProgress,
    ChessMove,
    ChessPuzzle,
)
from app.chess.schemas import (
    CoachSessionRequest,
    CoachSessionResponse,
    GameCreate,
    GameReviewResponse,
    MoveCreate,
    PuzzleResponse,
    TextTurnRequest,
    TextTurnResponse,
)
from app.core.config import Settings

COACH_TOOLS = [
    {
        "name": "suggest_move",
        "description": "Suggest the best move in the current position with explanation",
        "input_schema": {
            "type": "object",
            "properties": {
                "uci": {"type": "string", "description": "Move in UCI notation"},
                "explanation": {"type": "string", "description": "Why this move is good"},
            },
            "required": ["uci", "explanation"],
        },
    },
    {
        "name": "flag_principle",
        "description": "Flag a chess principle that was violated or upheld",
        "input_schema": {
            "type": "object",
            "properties": {
                "principle": {"type": "string"},
                "violated": {"type": "boolean"},
            },
            "required": ["principle", "violated"],
        },
    },
]


def _analyse_board_blocking(fen: str, *, depth: int = 14) -> dict[str, Any]:
    """Runs Stockfish (binary on PATH / docker image) synchronously."""

    board = chess_pkg.Board(fen)
    info: dict[str, Any]
    try:
        with chess.engine.SimpleEngine.popen_uci(["stockfish"]) as engine:
            info = engine.analyse(board, chess.engine.Limit(depth=depth))
    except Exception:  # noqa: BLE001
        return {"eval_cp": None, "mate": None, "best_uci": None}

    score = info.get("score")
    if score is None:
        return {"eval_cp": None, "mate": None, "best_uci": None}
    mate = score.relative.mate()
    cp = score.relative.score(mate_score=32000) if mate is None else None
    pv = info.get("pv") or ()
    best_uci = pv[0].uci() if pv else None

    return {"eval_cp": cp, "mate": mate, "best_uci": best_uci}


class ChessService:
    async def create_game(self, db: AsyncSession, data: GameCreate) -> ChessGame:
        game = ChessGame(
            id=uuid.uuid4(),
            user_id=data.user_id,
            guest_id=data.guest_id,
            white_level=data.white_level,
            status="active",
        )
        db.add(game)
        await db.flush()
        await db.refresh(game)

        return game

    async def save_move(self, db: AsyncSession, data: MoveCreate) -> ChessMove:
        analysis = await asyncio.to_thread(_analyse_board_blocking, data.fen, depth=14)
        eval_cp = analysis["eval_cp"]
        best_uci = analysis["best_uci"]

        move_quality = None

        move = ChessMove(
            id=uuid.uuid4(),
            game_id=data.game_id,
            ply=data.ply,
            uci=data.uci,
            san=data.san,
            fen=data.fen,
            eval_cp=int(eval_cp) if eval_cp is not None else None,
            best_uci=best_uci,
            move_quality=move_quality,
            time_spent_ms=data.time_spent_ms,
        )
        db.add(move)
        await db.flush()
        await db.refresh(move)
        return move

    async def get_signed_url(
        self, settings: Settings, data: CoachSessionRequest
    ) -> CoachSessionResponse:
        session_id = str(uuid.uuid4())
        dynamic_variables: dict[str, Any] = {
            "user_name": data.user_name,
            "user_level": data.user_level,
            "opponent_level": str(data.opponent_level),
            "current_opening": data.current_opening,
            "recent_principles": ", ".join(data.recent_principles),
            "game_id": str(data.game_id),
        }

        if not settings.ELEVENLABS_API_KEY.strip() or not settings.ELEVENLABS_AGENT_ID.strip():
            msg = (
                "ElevenLabs is not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in the backend `.env`."
            )
            raise ValueError(msg)

        url = (
            "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url"
            f"?agent_id={settings.ELEVENLABS_AGENT_ID}"
        )
        import httpx  # defer import keeps tests light

        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                url,
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
                json={
                    "conversation_initiation_client_data": {"dynamic_variables": dynamic_variables},
                },
            )
            resp.raise_for_status()

        payload = resp.json()
        signed_url = str(payload.get("signed_url") or "")
        if not signed_url:
            raise ValueError("ElevenLabs response missing signed_url")

        return CoachSessionResponse(signed_url=signed_url, session_id=session_id)

    async def review_game(
        self, db: AsyncSession, game_id: uuid.UUID
    ) -> GameReviewResponse:
        result = await db.execute(select(ChessGame).where(ChessGame.id == game_id))
        game = result.scalar_one_or_none()
        if game is None:
            raise ValueError(f"Game {game_id} not found")

        moves_result = await db.execute(
            select(ChessMove).where(ChessMove.game_id == game_id).order_by(ChessMove.ply)
        )
        db_moves = list(moves_result.scalars().all())

        analyzed_moves: list[dict[str, Any]] = []
        key_moments: list[dict[str, Any]] = []

        for move in db_moves:
            analyzed_moves.append(
                {
                    "ply": move.ply,
                    "uci": move.uci,
                    "san": move.san,
                    "fen": move.fen,
                    "eval_cp": move.eval_cp,
                    "best_uci": move.best_uci,
                    "move_quality": move.move_quality,
                }
            )

            if move.move_quality in ("blunder", "mistake") and move.eval_cp is not None:
                key_moments.append(
                    {
                        "ply": move.ply,
                        "san": move.san,
                        "quality": move.move_quality,
                        "eval_cp": move.eval_cp,
                        "best_uci": move.best_uci,
                    }
                )

        summary = (
            f"Game analyzed: {len(db_moves)} moves played, "
            f"{len(key_moments)} key moments found "
            f"({sum(1 for m in key_moments if m['quality'] == 'blunder')} blunders, "
            f"{sum(1 for m in key_moments if m['quality'] == 'mistake')} mistakes)."
        )

        return GameReviewResponse(moves=analyzed_moves, key_moments=key_moments, summary=summary)

    async def get_puzzles_from_game(
        self, db: AsyncSession, game_id: uuid.UUID
    ) -> list[PuzzleResponse]:
        puzzles_result = await db.execute(select(ChessPuzzle).where(ChessPuzzle.game_id == game_id))
        puzzles = list(puzzles_result.scalars().all())
        return [PuzzleResponse.model_validate(p) for p in puzzles]

    async def text_turn(
        self,
        settings: Settings,
        data: TextTurnRequest,
    ) -> TextTurnResponse:
        if not settings.ANTHROPIC_API_KEY.strip():
            return TextTurnResponse(
                reply="Текстовый режим отключён: задайте ANTHROPIC_API_KEY на сервере.",
                tool_calls=[],
            )

        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        system_prompt = (
            "You are an expert chess tutor (coach Ustaz). Keep answers concise, warm, pedagogical Russian. "
            f"Текущая позиция (FEN): {data.fen}. "
            f"История ходов SAN: {', '.join(data.history) if data.history else 'нет'}."
        )

        messages = [{"role": "user", "content": data.message}]

        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=900,
            system=system_prompt,
            tools=COACH_TOOLS,
            messages=messages,
        )

        reply_parts: list[str] = []
        tool_calls: list[dict[str, Any]] = []

        for block in response.content:
            if block.type == "text":
                reply_parts.append(block.text)
            elif block.type == "tool_use":
                tool_calls.append({"name": block.name, "input": block.input, "id": block.id})

        return TextTurnResponse(reply="\n".join(reply_parts), tool_calls=tool_calls)

    async def migrate_guest_to_user(
        self, db: AsyncSession, guest_token: str, new_user_id: uuid.UUID
    ) -> None:
        guest_token = guest_token.strip()
        async with db.begin_nested():
            ids_result = await db.execute(select(ChessGame.id).where(ChessGame.guest_id == guest_token))
            game_ids: list[uuid.UUID] = list(ids_result.scalars().all())

            await db.execute(
                update(ChessGame)
                .where(ChessGame.guest_id == guest_token)
                .values(user_id=new_user_id, guest_id=None),
            )

            if game_ids:
                await db.execute(
                    update(ChessPuzzle)
                    .where(ChessPuzzle.game_id.in_(game_ids))
                    .values(user_id=new_user_id),
                )

                await db.execute(
                    update(ChessCoachSession)
                    .where(ChessCoachSession.game_id.in_(game_ids))
                    .values(user_id=new_user_id),
                )

            await db.execute(
                update(ChessLearningProgress)
                .where(ChessLearningProgress.guest_id == guest_token)
                .values(user_id=new_user_id, guest_id=None),
            )

            # Principles may have been keyed only via user_uuid for registered users —
            # nothing special for transient guests unless we duplicate guest UUID into user rows.

            await db.execute(
                delete(User).where(User.guest_id == guest_token, User.id != new_user_id),
            )


chess_service = ChessService()
