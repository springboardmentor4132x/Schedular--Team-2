from fastapi import APIRouter

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


@router.post("/")
def create_campaign():
    """Creates a new campaign for a user."""
    return {"message": "Pending Implementation (Anwin)"}

@router.get("/")
def list_campaigns():
    """Lists all campaigns for the logged-in user."""
    return {"message": "Pending Implementation (Anwin)"}
