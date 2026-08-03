from typing import List

from fastapi import APIRouter

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
    get_campaign_summary,
    get_campaign_analytics,
    get_campaign_performance,
)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate
from app.services import campaign_service

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse)
def create_new_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.create_campaign(db, current_user.id, campaign)


@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_all_campaigns(db, current_user.id)



@router.get("/{campaign_id}")
def get_campaign(campaign_id: int):
    return get_campaign_by_id(campaign_id)

@router.put("/{campaign_id}")
def update_existing_campaign(campaign_id: int):
    return update_campaign(campaign_id)

@router.delete("/{campaign_id}")
def delete_existing_campaign(campaign_id: int):
    return delete_campaign(campaign_id)

@router.post("/{campaign_id}/assign-post/{post_id}")
def assign_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.assign_post_to_campaign(db, current_user.id, campaign_id, post_id)


@router.delete("/{campaign_id}/remove-post/{post_id}")
def remove_post(
    campaign_id: int,
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.remove_post_from_campaign(db, current_user.id, campaign_id, post_id)


@router.get("/{campaign_id}/timeline")
def campaign_timeline(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_timeline(db, current_user.id, campaign_id)


@router.get("/{campaign_id}/progress")
def campaign_progress(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_progress(db, current_user.id, campaign_id)


@router.get("/{campaign_id}/summary")
def campaign_summary(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_summary(
        db,
        current_user.id,
        campaign_id,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_by_id(
        db,
        current_user.id,
        campaign_id,
    )


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_existing_campaign(
    campaign_id: int,
    campaign: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.update_campaign(
        db,
        current_user.id,
        campaign_id,
        campaign,
    )


@router.delete("/{campaign_id}")
def delete_existing_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.delete_campaign(
        db,
        current_user.id,
        campaign_id,
    )


@router.get("/{campaign_id}/analytics")
def campaign_analytics(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_analytics(
        db,
        current_user.id,
        campaign_id,
    )


@router.get("/{campaign_id}/performance")
def campaign_performance(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_service.get_campaign_performance(
        db,
        current_user.id,
        campaign_id,
    )