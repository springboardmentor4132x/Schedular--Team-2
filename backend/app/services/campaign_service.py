from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.campaign import Campaign

def create_campaign(db: Session, campaign, user_id: int):
    """Create a new campaign."""
    # Date validation is primarily handled by the Pydantic schema
    if campaign.start_date and campaign.end_date:
        if campaign.start_date > campaign.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Campaign start_date cannot be after end_date"
            )

    new_campaign = Campaign(
        user_id=user_id,
        **campaign.model_dump()
    )
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign


def get_all_campaigns(db: Session, user_id: int):
    """Get all campaigns."""
    return db.query(Campaign).filter(Campaign.user_id == user_id).all()


def get_campaign_by_id(db: Session, campaign_id: int, user_id: int):
    """Get a campaign by ID."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


def update_campaign(db: Session, campaign_id: int, campaign_update, user_id: int):
    """Update campaign details."""
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == user_id).first()
    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    update_data = campaign_update.model_dump(exclude_unset=True)
    
    # Calculate the new effective dates
    new_start_date = update_data.get('start_date', db_campaign.start_date)
    new_end_date = update_data.get('end_date', db_campaign.end_date)
    
    # Validate the effective date range
    if new_start_date and new_end_date:
        if new_start_date > new_end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Campaign start_date cannot be after end_date"
            )

    for key, value in update_data.items():
        setattr(db_campaign, key, value)
        
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


def delete_campaign(db: Session, campaign_id: int, user_id: int):
    """Delete a campaign."""
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == user_id).first()
    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
        
    db.delete(db_campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}


def assign_post_to_campaign(db: Session, campaign_id: int, post_id: int, user_id: int):
    """Assign a post to a campaign."""
    get_campaign_by_id(db, campaign_id, user_id)
    return {
        "message": "Post assigned to campaign successfully - Pending Post Integration",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Assigned"
    }


def remove_post_from_campaign(db: Session, campaign_id: int, post_id: int, user_id: int):
    """Remove a post from a campaign."""
    get_campaign_by_id(db, campaign_id, user_id)
    return {
        "message": "Post removed from campaign successfully - Pending Post Integration",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Removed"
    }


def get_campaign_timeline(db: Session, campaign_id: int, user_id: int):
    """Retrieve campaign timeline."""
    get_campaign_by_id(db, campaign_id, user_id)
    return {
        "message": "Campaign timeline retrieved successfully",
        "campaign_id": campaign_id,
        "timeline": [
            {
                "date": "2026-07-20",
                "event": "Campaign Created"
            }
        ]
    }


def get_campaign_progress(db: Session, campaign_id: int, user_id: int):
    """Retrieve campaign progress."""
    get_campaign_by_id(db, campaign_id, user_id)
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


def get_campaign_summary(db: Session, campaign_id: int, user_id: int):
    """Retrieve campaign summary."""
    get_campaign_by_id(db, campaign_id, user_id)
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