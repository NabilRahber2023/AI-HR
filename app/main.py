from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine
from app.database.base import Base

# Import all models to register them
from app.users.models import User
from app.employees.models import Employee
from app.users.extra_models import UploadedDataset, ChatHistory, ModelRegistry, PredictionLog

# Import routers
from app.auth.routes import router as auth_router
from app.employees.routes import router as employees_router
from app.analytics.routes import router as analytics_router
from app.ml.routes import router as ml_router
from app.recommendation.routes import router as recommendation_router
from app.chatbot.routes import router as chatbot_router

# Create tables. Best-effort: on a serverless cold start the database may be
# briefly unreachable, and this runs at import time — so never let it crash the
# whole function (which would surface as FUNCTION_INVOCATION_FAILED). Any real
# connectivity problem still surfaces on the request that actually needs the DB.
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:  # pragma: no cover - depends on runtime DB availability
    import logging
    logging.getLogger("uvicorn.error").warning(
        "Skipped create_all at startup (database not reachable yet): %s", exc
    )

app = FastAPI(
    title="HR AI Platform - 9-Box Grid",
    description="AI-Powered Employee Performance & Potential Management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(analytics_router)
app.include_router(ml_router)
app.include_router(recommendation_router)
app.include_router(chatbot_router)


@app.get("/")
def root():
    return {"message": "HR AI Platform API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
