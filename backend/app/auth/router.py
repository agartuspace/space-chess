from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.schemas import GuestCreate, Token, UserCreate, UserLogin, UserResponse
from app.auth.service import (
    authenticate_user,
    create_guest,
    create_tokens,
    create_user,
    get_current_user,
)
from app.chess.service import chess_service
from app.core.database import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/guest", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_guest(
    data: GuestCreate,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = await create_guest(db, data.guest_id)
    return create_tokens(str(user.id))


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    guest_id: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = await create_user(db, data)
    if guest_id:
        try:
            await chess_service.migrate_guest_to_user(db, guest_id, user.id)
        except Exception:
            pass
    return create_tokens(str(user.id))


@router.post("/login", response_model=Token)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = await authenticate_user(db, data.email, data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return create_tokens(str(user.id))


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)
