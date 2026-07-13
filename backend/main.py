from fastapi import FastAPI
from app.core.config import settings
from app.database.database import engine, Base
import app.models  # Import all models to register with Base

# Auto-generate database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Import our API routers
from app.routers import auth, campaigns, posts, workspaces
from app.routers import settings as settings_router
from app.routers import social_accounts

from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Social Media Scheduler & Campaign Management Platform API"
)

# Add CORS Middleware to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Allow React's dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers from our team members
app.include_router(auth.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(workspaces.router, prefix="/api/v1")
app.include_router(social_accounts.router, prefix="/api/v1")

@app.get("/")
def root():
    """Health check endpoint at the root."""
    return {"status": "Backend is running!"}
