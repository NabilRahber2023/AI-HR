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

# Create tables
Base.metadata.create_all(bind=engine)

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
