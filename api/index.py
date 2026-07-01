"""Vercel serverless entry point.

Vercel's Python runtime serves the module-level ``app`` object. FastAPI is an
ASGI application, so exposing it here lets Vercel route every request to it.
The real application lives in ``app/main.py`` — this file only re-exports it.
"""
from app.main import app  # noqa: F401

# Explicit alias so the ASGI callable is unambiguous to the runtime.
handler = app
