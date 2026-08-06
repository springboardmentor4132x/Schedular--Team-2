import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.database.database import Base, engine
from app.middleware.access_logger import AccessLoggerMiddleware
from app.services.background_worker import start_publishing_worker

import app.models

from app.routers import (
    admin,
    analytics,
    auth,
    business,
    campaigns,
    marketing,
    notifications,
    posts,
    publishing,
    social_accounts,
    users,
    workspaces,
)

from app.routers import settings as settings_router

# Create database tables.
Base.metadata.create_all(bind=engine)

# Application lifespan.
@asynccontextmanager
async def lifespan(app: FastAPI):
    worker = asyncio.create_task(start_publishing_worker())
    yield
    worker.cancel()

# Initialize the application.
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Social Media Scheduler & Campaign Management Platform API",
    lifespan=lifespan,
)

# Configure CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure sessions.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
)

# Add custom middleware.
app.add_middleware(AccessLoggerMiddleware)

# Register API routes.
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(campaigns.router, prefix="/api/v1", tags=["Campaigns"])
app.include_router(posts.router, prefix="/api/v1", tags=["Posts"])
app.include_router(workspaces.router, prefix="/api/v1", tags=["Workspaces"])
app.include_router(settings_router.router, prefix="/api/v1", tags=["Settings"])
app.include_router(social_accounts.router, prefix="/api/v1", tags=["Social Accounts"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(business.router, prefix="/api/v1", tags=["Business"])
app.include_router(marketing.router, prefix="/api/v1", tags=["Marketing"])
app.include_router(publishing.router, prefix="/api/v1", tags=["Publishing"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])

# Serve uploaded files.
os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.MEDIA_DIR), name="uploads")

# Health check endpoint.
@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
    }