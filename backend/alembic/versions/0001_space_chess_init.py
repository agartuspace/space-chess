"""Initial Space Chess schema (users + chess tables).

Revision ID: 0001_space_chess
Revises:
Create Date: 2026-05-03
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001_space_chess"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=256), nullable=True),
        sa.Column("username", sa.String(length=64), nullable=True),
        sa.Column("hashed_password", sa.String(length=256), nullable=True),
        sa.Column("is_guest", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("guest_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_guest_id", "users", ["guest_id"], unique=True)

    op.create_table(
        "chess_games",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("guest_id", sa.String(length=128), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("result", sa.String(length=32), nullable=True),
        sa.Column("pgn", sa.Text(), nullable=True),
        sa.Column("opening_eco", sa.String(length=8), nullable=True),
        sa.Column("opening_name", sa.String(length=128), nullable=True),
        sa.Column("white_level", sa.Integer(), nullable=False),
        sa.Column("black_level", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chess_games_user_id", "chess_games", ["user_id"])
    op.create_index("ix_chess_games_guest_id", "chess_games", ["guest_id"])

    op.create_table(
        "chess_moves",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "game_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chess_games.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ply", sa.Integer(), nullable=False),
        sa.Column("uci", sa.String(length=8), nullable=False),
        sa.Column("san", sa.String(length=16), nullable=False),
        sa.Column("fen", sa.String(length=128), nullable=False),
        sa.Column("eval_cp", sa.Integer(), nullable=True),
        sa.Column("best_uci", sa.String(length=8), nullable=True),
        sa.Column("move_quality", sa.String(length=16), nullable=True),
        sa.Column("was_rewound", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("time_spent_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chess_moves_game_id", "chess_moves", ["game_id"])

    op.create_table(
        "chess_principles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("times_violated", sa.Integer(), nullable=False),
        sa.Column("times_respected", sa.Integer(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "chess_learning_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("guest_id", sa.String(length=128), nullable=True),
        sa.Column("chess_level", sa.String(length=32), nullable=False),
        sa.Column("calibration_score", sa.Integer(), nullable=False),
        sa.Column("games_played", sa.Integer(), nullable=False),
        sa.Column("puzzles_solved", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "chess_coach_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "game_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chess_games.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "transcript_jsonb",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "tool_calls_jsonb",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("cost_usd", sa.Float(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "chess_puzzles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "game_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chess_games.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("fen", sa.String(length=128), nullable=False),
        sa.Column("solution_uci", sa.String(length=64), nullable=False),
        sa.Column("theme", sa.String(length=64), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column(
            "attempts",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("solved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "chess_lichess_puzzles",
        sa.Column("id", sa.String(length=16), primary_key=True),
        sa.Column("fen", sa.String(length=128), nullable=False),
        sa.Column("moves", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("themes", sa.Text(), nullable=False),
        sa.Column("opening_tags", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chess_lichess_puzzles_rating", "chess_lichess_puzzles", ["rating"])


def downgrade() -> None:
    op.drop_index("ix_chess_lichess_puzzles_rating", table_name="chess_lichess_puzzles")
    op.drop_table("chess_lichess_puzzles")

    op.drop_table("chess_puzzles")
    op.drop_table("chess_coach_sessions")
    op.drop_table("chess_learning_progress")
    op.drop_table("chess_principles")

    op.drop_index("ix_chess_moves_game_id", table_name="chess_moves")
    op.drop_table("chess_moves")

    op.drop_index("ix_chess_games_guest_id", table_name="chess_games")
    op.drop_index("ix_chess_games_user_id", table_name="chess_games")
    op.drop_table("chess_games")

    op.drop_index("ix_users_guest_id", table_name="users")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
