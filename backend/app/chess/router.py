import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.chess.models import ChessLearningProgress
from app.chess.schemas import (
    CoachSessionRequest,
    CoachSessionResponse,
    GameCreate,
    GameResponse,
    MigrateGuestBody,
    MoveCreate,
    MoveResponse,
    ProgressResponse,
    PuzzleResponse,
    TextTurnRequest,
    TextTurnResponse,
)
from app.chess.service import chess_service
from app.core.config import settings
from app.core.database import get_db
from app.core.redis_client import get_redis

router = APIRouter(prefix="/api/v1/chess", tags=["chess"])

_RATE_LIMIT_WINDOW = 60
_RATE_LIMIT_MAX = 3


async def _check_rate_limit(request: Request, key_prefix: str) -> None:
    """Simple sliding-window rate limiter stored in Redis."""
    try:
        redis = await get_redis()
        client_ip = request.client.host if request.client else "unknown"
        key = f"rl:{key_prefix}:{client_ip}"
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, _RATE_LIMIT_WINDOW)
        if count > _RATE_LIMIT_MAX:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again in a minute.",
            )
    except HTTPException:
        raise
    except Exception:  # noqa: BLE001 — Redis optional in local dev
        return


@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    data: GameCreate,
    db: AsyncSession = Depends(get_db),
) -> GameResponse:
    game = await chess_service.create_game(db, data)
    return GameResponse.model_validate(game)


@router.post(
    "/games/{game_id}/moves",
    response_model=MoveResponse,
    status_code=status.HTTP_201_CREATED,
)
async def save_move(
    game_id: uuid.UUID,
    data: MoveCreate,
    db: AsyncSession = Depends(get_db),
) -> MoveResponse:
    if data.game_id != game_id:
        raise HTTPException(status_code=400, detail="game_id mismatch")
    move = await chess_service.save_move(db, data)
    return MoveResponse.model_validate(move)


@router.post("/coach/session", response_model=CoachSessionResponse)
async def get_coach_session(
    request: Request,
    data: CoachSessionRequest,
    db: AsyncSession = Depends(get_db),
) -> CoachSessionResponse:
    await _check_rate_limit(request, "coach_session")
    try:
        return await chess_service.get_signed_url(settings, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/coach/text-turn", response_model=TextTurnResponse)
async def text_turn(
    data: TextTurnRequest,
    db: AsyncSession = Depends(get_db),
) -> TextTurnResponse:
    return await chess_service.text_turn(settings, data)


@router.get("/games/{game_id}/review")
async def review_game(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    async def _stream() -> AsyncGenerator[str, None]:
        try:
            review = await chess_service.review_game(db, game_id)
            payload = review.model_dump()
            yield f"data: {json.dumps(payload)}\n\n"
        except ValueError as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(_stream(), media_type="text/event-stream")


@router.get("/puzzles/from-game/{game_id}", response_model=list[PuzzleResponse])
async def get_puzzles_from_game(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[PuzzleResponse]:
    return await chess_service.get_puzzles_from_game(db, game_id)


@router.get("/progress/{user_id}", response_model=ProgressResponse)
async def get_progress(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ProgressResponse:
    result = await db.execute(
        select(ChessLearningProgress).where(ChessLearningProgress.user_id == user_id)
    )
    progress = result.scalar_one_or_none()
    if progress is None:
        raise HTTPException(status_code=404, detail="Progress record not found")
    return ProgressResponse.model_validate(progress)


@router.post("/progress/migrate-guest", status_code=status.HTTP_204_NO_CONTENT)
async def migrate_guest(
    payload: MigrateGuestBody,
    db: AsyncSession = Depends(get_db),
) -> None:
    await chess_service.migrate_guest_to_user(db, payload.guest_id, payload.user_id)
