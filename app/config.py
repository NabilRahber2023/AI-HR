from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # In production (e.g. Vercel) DATABASE_URL MUST be provided via an
    # environment variable pointing at a hosted database (e.g. Postgres). The
    # default below is a local SQLite file for development only — it deliberately
    # does NOT point at a localhost database server, so a missing env var never
    # causes a "connection refused to 127.0.0.1:5432" failure in the cloud.
    DATABASE_URL: str = "sqlite:///./hr_ai_platform.db"
    SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production-minimum-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
