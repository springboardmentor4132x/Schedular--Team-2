from fastapi import FastAPI

from app.database.database import Base, engine

# Import models before creating tables
from app.models.user import User

from app.routers import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SocialPilot Scheduler API",
    version="1.0.0"
)

# Include Routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "SocialPilot Scheduler Backend Running Successfully"
    }