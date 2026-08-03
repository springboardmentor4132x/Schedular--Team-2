import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database.database import engine, Base
import app.models  # Import all models to register with Base
from starlette.middleware.sessions import SessionMiddleware

# Auto-generate database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Import our API routers
from app.routers import (
    auth,
    campaigns,
    posts,
    users,
    social_accounts,
    workspaces,
    admin,
    notifications,
    business,
    marketing,
)

from app.routers import settings as settings_router

# Initialize the FastAPI App
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

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key="socialpilot_session_secret"
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(campaigns.router, prefix="/api/v1", tags=["Campaigns"])
app.include_router(posts.router, prefix="/api/v1", tags=["Posts"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(workspaces.router, prefix="/api/v1", tags=["Workspaces"])
app.include_router(settings_router.router, prefix="/api/v1", tags=["Settings"])
app.include_router(social_accounts.router, prefix="/api/v1", tags=["Social Accounts"])

app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(business.router, prefix="/api/v1", tags=["Business"])
app.include_router(marketing.router, prefix="/api/v1", tags=["Marketing"])

# Serve uploaded media files
os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.MEDIA_DIR), name="uploads")

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "Project": settings.PROJECT_NAME,
        "Version": settings.VERSION,
        "Status": "Running",
    }
