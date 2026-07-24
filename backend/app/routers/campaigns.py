from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse

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


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_new_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_campaign(db, campaign, current_user.id)


@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_campaigns(db, current_user.id)


@router.post("/{campaign_id}/assign-post/{post_id}")
def assign_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return assign_post_to_campaign(db, campaign_id, post_id, current_user.id)


@router.delete("/{campaign_id}/remove-post/{post_id}")
def remove_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return remove_post_from_campaign(db, campaign_id, post_id, current_user.id)


@router.get("/{campaign_id}/timeline")
def campaign_timeline(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_campaign_timeline(db, campaign_id, current_user.id)


@router.get("/{campaign_id}/progress")
def campaign_progress(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_campaign_progress(db, campaign_id, current_user.id)


@router.get("/{campaign_id}/summary")
def campaign_summary(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_campaign_summary(db, campaign_id, current_user.id)


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_campaign_by_id(db, campaign_id, current_user.id)


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_existing_campaign(
    campaign_id: int,
    campaign: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_campaign(db, campaign_id, campaign, current_user.id)


@router.delete("/{campaign_id}")
def delete_existing_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_campaign(db, campaign_id, current_user.id)