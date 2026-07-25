from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.campaign import Campaign

def create_campaign(campaign, db: Session, current_user):
    """Create a new campaign."""

    # Check for overlapping campaign dates
    existing_campaign = db.query(Campaign).filter(
        Campaign.user_id == current_user.id,
        Campaign.start_date <= campaign.end_date,
        Campaign.end_date >= campaign.start_date
    ).first()

    if existing_campaign:
        raise HTTPException(
            status_code=400,
            detail="Campaign dates overlap with an existing campaign."
        )

    new_campaign = Campaign(
        user_id=current_user.id,
        name=campaign.campaign_name,
        start_date=campaign.start_date,
        end_date=campaign.end_date
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return {
        "message": "Campaign created successfully",
        "campaign_id": new_campaign.id
    }
def get_all_campaigns(db: Session, current_user):
    campaigns = db.query(Campaign).filter(
        Campaign.user_id == current_user.id
    ).all()

    return campaigns


def get_campaign_by_id(campaign_id: int, db: Session, current_user):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this campaign."
        )

    return campaign


def update_campaign(campaign_id: int, campaign_data, db: Session, current_user):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this campaign."
        )

    campaign.name = campaign_data.campaign_name
    campaign.start_date = campaign_data.start_date
    campaign.end_date = campaign_data.end_date

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign updated successfully",
        "campaign": campaign
    }


def delete_campaign(campaign_id: int, db: Session, current_user):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete this campaign."
        )

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully"
    }


def assign_post_to_campaign(campaign_id: int, post_id: int):
    """Assign a post to a campaign."""
    return {
        "message": "Post assigned to campaign successfully",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Assigned"
    }


def remove_post_from_campaign(campaign_id: int, post_id: int):
    """Remove a post from a campaign."""
    return {
        "message": "Post removed from campaign successfully",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Removed"
    }


def get_campaign_timeline(campaign_id: int):
    """Retrieve campaign timeline."""
    return {
        "message": "Campaign timeline retrieved successfully",
        "campaign_id": campaign_id,
        "timeline": [
            {
                "date": "2026-07-20",
                "event": "Campaign Created"
            },
            {
                "date": "2026-07-21",
                "event": "Post Assigned"
            },
            {
                "date": "2026-07-22",
                "event": "Post Scheduled"
            }
        ]
    }


def get_campaign_progress(campaign_id: int):
    """Retrieve campaign progress."""
    return {
        "message": "Campaign progress retrieved successfully",
        "campaign_id": campaign_id,
        "progress": {
            "total_posts": 10,
            "published": 6,
            "scheduled": 3,
            "drafts": 1,
            "completion_percentage": 60
        }
    }


def get_campaign_summary(campaign_id: int):
    """Retrieve campaign summary."""
    return {
        "message": "Campaign summary retrieved successfully",
        "campaign_id": campaign_id,
        "summary": {
            "campaign_name": "Summer Marketing Campaign",
            "total_posts": 10,
            "published_posts": 6,
            "scheduled_posts": 3,
            "draft_posts": 1,
            "status": "Active"
        }
    }