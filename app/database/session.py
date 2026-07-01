import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.config import settings


def _normalize_db_url(url: str) -> str:
    """Make an arbitrary DATABASE_URL safe to use in serverless production.

    - Managed Postgres providers (Neon, Supabase, Heroku, Render, ...) often hand
      out URLs starting with ``postgres://``, which SQLAlchemy no longer accepts;
      rewrite them to the canonical ``postgresql://``.
    - On Vercel the working directory is read-only, so a file-based SQLite URL is
      relocated to the writable ``/tmp`` directory. (Production should use a real
      hosted database via DATABASE_URL; this only keeps SQLite from crashing.)
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]

    if url.startswith("sqlite") and os.environ.get("VERCEL"):
        if ":///" in url and ":memory:" not in url:
            url = "sqlite:////tmp/hr_ai_platform.db"

    return url


DATABASE_URL = _normalize_db_url(settings.DATABASE_URL)
_is_sqlite = DATABASE_URL.startswith("sqlite")

engine_kwargs = {"pool_pre_ping": True}
if _is_sqlite:
    # SQLite needs this to be used across threads (FastAPI worker threads).
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Serverless functions are short-lived and scale horizontally, so a
    # persistent connection pool would quickly exhaust the database's connection
    # limit. NullPool opens a fresh connection per checkout and closes it after,
    # which is the recommended pattern for Vercel/Lambda-style deployments.
    engine_kwargs["poolclass"] = NullPool

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
