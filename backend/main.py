from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import engine, Base
import app.models  # Register all models

# Auto-create database tables
Base.metadata.create_all(bind=engine)

from app.routers import (
    auth,
    campaigns,
    posts,
    users,
    social_accounts,
    workspaces,
)

from app.routers import settings as settings_router

# Initialize FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Social Media Scheduler & Campaign Management Platform API",
)


# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(social_accounts.router, prefix="/api/v1")


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "Project": settings.PROJECT_NAME,
        "Version": settings.VERSION,
        "Status": "Running"
    }