from fastapi import APIRouter

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


@router.post("/")
def create_campaign():
    """Creates a new campaign for a user."""
    return {"message": "Create Campaign "}

@router.get("/")
def get_campaigns():
    """Lists all campaigns for the logged-in user."""
    return {"message": "Get All Campaigns "}

@router.get("/{campaign_id}")
def get_campaign(campaign_id: int):
    return {"message": f"Get Campaign {campaign_id}"}


@router.put("/{campaign_id}")
def update_campaign(campaign_id: int):
    return {"message": f"Update Campaign {campaign_id}"}


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int):
    return {"message": f"Delete Campaign {campaign_id}"}