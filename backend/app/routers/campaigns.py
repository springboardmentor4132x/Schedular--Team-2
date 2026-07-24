from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.campaign import CampaignCreate, CampaignUpdate

from app.services.campaign_service import (
    create_campaign,
    get_all_campaigns,
    get_campaign_by_id,
    update_campaign,
    delete_campaign,
    assign_post_to_campaign,
    remove_post_from_campaign,
    get_campaign_timeline,
    get_campaign_progress,
    get_campaign_summary
)

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


@router.post("/")
def create_new_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_user)
):
    return create_campaign(campaign)

@router.get("/")
def get_campaigns(
    current_user: User = Depends(get_current_user)
):
     return get_all_campaigns()


@router.post("/{campaign_id}/assign-post/{post_id}")
def assign_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user)
):
    return assign_post_to_campaign(campaign_id, post_id)


@router.delete("/{campaign_id}/remove-post/{post_id}")
def remove_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user)
):
   return remove_post_from_campaign(campaign_id, post_id)


@router.get("/{campaign_id}/timeline")
def campaign_timeline(
    campaign_id: int,
    current_user: User = Depends(get_current_user)
):
     return get_campaign_timeline(campaign_id)


@router.get("/{campaign_id}/progress")
def campaign_progress(
    campaign_id: int,
    current_user: User = Depends(get_current_user)
):
     return get_campaign_progress(campaign_id)


@router.get("/{campaign_id}/summary")
def campaign_summary(
    campaign_id: int,
    current_user: User = Depends(get_current_user)
):
     return get_campaign_summary(campaign_id)


@router.get("/{campaign_id}")
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user)
):
    return get_campaign_by_id(campaign_id)


@router.put("/{campaign_id}")
def update_existing_campaign(
    campaign_id: int,
    campaign: CampaignUpdate,
    current_user: User = Depends(get_current_user)
):
    return update_campaign(campaign_id, campaign)


@router.delete("/{campaign_id}")
def delete_existing_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user)
):
       return delete_campaign(campaign_id)