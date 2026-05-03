import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class GameCreate(BaseModel):
    user_id: uuid.UUID | None = None
    guest_id: str | None = None
    white_level: int = 5


class GameResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    guest_id: str | None
    status: str
    result: str | None
    pgn: str | None
    opening_name: str | None
    white_level: int
    created_at: datetime


class MoveCreate(BaseModel):
    game_id: uuid.UUID
    ply: int
    uci: str
    san: str
    fen: str
    time_spent_ms: int | None = None


class MoveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    game_id: uuid.UUID
    ply: int
    uci: str
    san: str
    fen: str
    time_spent_ms: int | None
    eval_cp: int | None
    best_uci: str | None
    move_quality: str | None
    was_rewound: bool
    created_at: datetime


class CoachSessionRequest(BaseModel):
    game_id: uuid.UUID
    user_name: str = "Игрок"
    user_level: str = "beginner"
    recent_principles: list[str] = []
    current_opening: str = ""
    opponent_level: int = 5


class CoachSessionResponse(BaseModel):
    signed_url: str
    session_id: str


class GameReviewRequest(BaseModel):
    game_id: uuid.UUID


class GameReviewResponse(BaseModel):
    moves: list[Any]
    key_moments: list[dict[str, Any]]
    summary: str


class PuzzleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    fen: str
    solution_uci: str
    theme: str | None
    rating: int | None
    attempts: list[Any]
    solved: bool


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chess_level: str
    calibration_score: int
    games_played: int
    puzzles_solved: int


class TextTurnRequest(BaseModel):
    game_id: uuid.UUID | None = None
    message: str
    fen: str
    history: list[str] = []


class TextTurnResponse(BaseModel):
    reply: str
    tool_calls: list[dict[str, Any]] = []


class MigrateGuestBody(BaseModel):
    guest_id: str
    user_id: uuid.UUID
