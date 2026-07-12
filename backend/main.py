from fastapi import FastAPI
from app.core.config import settings

# Import our API routers
from app.routers import auth, campaigns, posts

# Initialize the FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Social Media Scheduler & Campaign Management Platform API"
)

# Include Routers from our team members
app.include_router(auth.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")

@app.get("/")
def root():
    """Health check endpoint at the root."""
    return {"status": "Backend is running!"}