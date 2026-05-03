import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.chess.router import router as chess_router
from app.auth.router import router as auth_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Space Chess API",
    version="1.0.0",
    description="Backend API for the Space Chess learning platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chess_router)
app.include_router(auth_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("Space Chess API started")
