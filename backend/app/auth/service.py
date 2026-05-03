import uuid
from datetime import datetime, timedelta

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.models import User
from app.auth.schemas import Token, UserCreate
from app.core.config import settings
from app.core.database import get_db

bearer_scheme = HTTPBearer(auto_error=False)

# bcrypt only uses the first 72 bytes of UTF-8; longer passwords must be truncated explicitly.
_BCRYPT_MAX_BYTES = 72


def _password_bytes(plain: str) -> bytes:
    b = plain.encode("utf-8")
    if len(b) > _BCRYPT_MAX_BYTES:
        return b[:_BCRYPT_MAX_BYTES]
    return b


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(_password_bytes(plain), bcrypt.gensalt()).decode("ascii")


def _verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_password_bytes(plain), hashed.encode("ascii"))
    except ValueError:
        return False


def _create_token(subject: str, expires_delta: timedelta, token_type: str = "access") -> str:
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": subject,
        "type": token_type,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_tokens(user_id: str) -> Token:
    access_token = _create_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )
    refresh_token = _create_token(
        subject=user_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )
    uid = uuid.UUID(user_id)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=uid,
    )


async def create_guest(db: AsyncSession, guest_id: str) -> User:
    existing = await db.execute(select(User).where(User.guest_id == guest_id))
    user = existing.scalar_one_or_none()
    if user:
        return user
    user = User(
        id=uuid.uuid4(),
        guest_id=guest_id,
        is_guest=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        id=uuid.uuid4(),
        email=data.email,
        username=data.username,
        hashed_password=_hash_password(data.password),
        is_guest=False,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not user.hashed_password:
        return None
    if not _verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_exception
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
