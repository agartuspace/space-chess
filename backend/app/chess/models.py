import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ChessGame(Base):
    __tablename__ = "chess_games"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    guest_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    result: Mapped[str | None] = mapped_column(String(32), nullable=True)
    pgn: Mapped[str | None] = mapped_column(Text, nullable=True)
    opening_eco: Mapped[str | None] = mapped_column(String(8), nullable=True)
    opening_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    white_level: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    black_level: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    moves: Mapped[list["ChessMove"]] = relationship(
        "ChessMove", back_populates="game", cascade="all, delete-orphan"
    )
    puzzles: Mapped[list["ChessPuzzle"]] = relationship(
        "ChessPuzzle", back_populates="game", cascade="all, delete-orphan"
    )
    coach_sessions: Mapped[list["ChessCoachSession"]] = relationship(
        "ChessCoachSession", back_populates="game", cascade="all, delete-orphan"
    )


class ChessMove(Base):
    __tablename__ = "chess_moves"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chess_games.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ply: Mapped[int] = mapped_column(Integer, nullable=False)
    uci: Mapped[str] = mapped_column(String(8), nullable=False)
    san: Mapped[str] = mapped_column(String(16), nullable=False)
    fen: Mapped[str] = mapped_column(String(128), nullable=False)
    eval_cp: Mapped[int | None] = mapped_column(Integer, nullable=True)
    best_uci: Mapped[str | None] = mapped_column(String(8), nullable=True)
    move_quality: Mapped[str | None] = mapped_column(
        String(16), nullable=True
    )  # best/good/inaccuracy/mistake/blunder
    was_rewound: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    time_spent_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    game: Mapped["ChessGame"] = relationship("ChessGame", back_populates="moves")


class ChessPrinciple(Base):
    __tablename__ = "chess_principles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), default="learning", nullable=False
    )  # learning/practicing/mastered
    times_violated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    times_respected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class ChessPuzzle(Base):
    __tablename__ = "chess_puzzles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    game_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chess_games.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fen: Mapped[str] = mapped_column(String(128), nullable=False)
    solution_uci: Mapped[str] = mapped_column(String(64), nullable=False)
    theme: Mapped[str | None] = mapped_column(String(64), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    attempts: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    solved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    game: Mapped["ChessGame | None"] = relationship("ChessGame", back_populates="puzzles")


class ChessCoachSession(Base):
    __tablename__ = "chess_coach_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    game_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chess_games.id", ondelete="SET NULL"), nullable=True, index=True
    )
    transcript_jsonb: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    tool_calls_jsonb: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    game: Mapped["ChessGame | None"] = relationship("ChessGame", back_populates="coach_sessions")


class ChessLearningProgress(Base):
    __tablename__ = "chess_learning_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    guest_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    chess_level: Mapped[str] = mapped_column(String(32), default="beginner", nullable=False)
    calibration_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    games_played: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    puzzles_solved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class ChessLichessPuzzle(Base):
    __tablename__ = "chess_lichess_puzzles"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    fen: Mapped[str] = mapped_column(String(128), nullable=False)
    moves: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    themes: Mapped[str] = mapped_column(Text, nullable=False)
    opening_tags: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
