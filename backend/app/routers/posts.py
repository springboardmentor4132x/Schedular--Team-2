from fastapi import APIRouter

router = APIRouter(
    prefix="/posts",
    tags=["Posts & Scheduling"]
)

# ----------------------------------------------------
# @Anwin: Implement Post scheduling queries here
# ----------------------------------------------------

@router.post("/")
def schedule_post():
    """Schedules a new post (Saves metadata in Postgres, content in Mongo)."""
    return {"message": "Pending Implementation (Anwin)"}

@router.get("/")
def list_posts():
    """Gets scheduled posts."""
    return {"message": "Pending Implementation (Anwin)"}
