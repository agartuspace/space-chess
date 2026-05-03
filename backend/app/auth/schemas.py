import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    email: str
    password: str
    username: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str | None
    username: str | None
    is_guest: bool
    created_at: datetime


class Token(BaseModel):
    """Выдаётся при login/register/guest. ``user_id`` = ``users.id`` (без разбора JWT)."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID


class GuestCreate(BaseModel):
    guest_id: str
