from backend.app.routers import social_accounts, users
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Import our API routers
from app.routers import (
    auth, 
    campaigns, 
    posts,
    users,
    social_accounts,
    )

# Initialize the FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Social Media Scheduler & Campaign Management Platform API"
)


origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers from our team members
app.include_router(auth.router, prefix="/api/v1" ,tags=["Authentication"])
app.include_router(campaigns.router, prefix="/api/v1", tags=["Campaigns"])
app.include_router(posts.router, prefix="/api/v1", tags=["Posts"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(social_accounts.router, prefix="/api/v1", tags=["Social Accounts"])


@app.get("/")
def root():
    """Health check endpoint at the root."""
    return {"Project":settings.PROJECT_NAME,
            "Version":settings.VERSION,
            "Status":"Running"}