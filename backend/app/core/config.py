from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "space-chess"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://chess:chess@localhost:5432/chess_db"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_AGENT_ID: str = ""
    ANTHROPIC_API_KEY: str = ""

    LICHESS_API_BASE: str = "https://lichess.org"

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://space-chess.agartu.space"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
