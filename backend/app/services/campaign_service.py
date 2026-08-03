from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.campaign import Campaign
from app.models.post import Post
from app.schemas.campaign import CampaignCreate, CampaignUpdate

import json


def _platforms_to_str(platforms):
    if platforms is None:
        return None
    return json.dumps([p for p in platforms if p])


def _platforms_from_str(value):
    if not value:
        return []
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (ValueError, TypeError):
        return []


def _campaign_response(campaign: Campaign):
    return {
        "id": campaign.id,
        "user_id": campaign.user_id,
        "workspace_id": campaign.workspace_id,
        "name": campaign.name,
        "description": campaign.description,
        "objective": campaign.objective,
        "budget": campaign.budget,
        "priority": campaign.priority,
        "category": campaign.category,
        "status": campaign.status,
        "target_platforms": _platforms_from_str(campaign.target_platforms),
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
    }


def _get_owned_campaign(db: Session, user_id: int, campaign_id: int) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this campaign")
    return campaign


def create_campaign(db: Session, user_id: int, campaign: CampaignCreate):
    new_campaign = Campaign(
        user_id=user_id,
        workspace_id=campaign.workspace_id,
        name=campaign.name,
        description=campaign.description,
        objective=campaign.objective,
        budget=campaign.budget,
        priority=campaign.priority,
        category=campaign.category,
        status=campaign.status,
        target_platforms=_platforms_to_str(campaign.target_platforms),
        start_date=campaign.start_date,
        end_date=campaign.end_date,
    )
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return _campaign_response(new_campaign)


def get_all_campaigns(db: Session, user_id: int):
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .order_by(Campaign.created_at.desc())
        .all()
    )
    return [_campaign_response(c) for c in campaigns]


def get_campaign_by_id(db: Session, user_id: int, campaign_id: int):
    return _campaign_response(_get_owned_campaign(db, user_id, campaign_id))


def update_campaign(db: Session, user_id: int, campaign_id: int, campaign: CampaignUpdate):
    existing = _get_owned_campaign(db, user_id, campaign_id)

    fields = {
        "name": campaign.name,
        "description": campaign.description,
        "objective": campaign.objective,
        "budget": campaign.budget,
        "priority": campaign.priority,
        "category": campaign.category,
        "status": campaign.status,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "workspace_id": campaign.workspace_id,
    }
    for field, value in fields.items():
        if value is not None:
            setattr(existing, field, value)

    if campaign.target_platforms is not None:
        existing.target_platforms = _platforms_to_str(campaign.target_platforms)

    db.commit()
    db.refresh(existing)
    return _campaign_response(existing)


def delete_campaign(db: Session, user_id: int, campaign_id: int):
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}


def _get_owned_post(db: Session, user_id: int, post_id: int) -> Post:
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this post")
    return post


def assign_post_to_campaign(db: Session, user_id: int, campaign_id: int, post_id: int):
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    post = _get_owned_post(db, user_id, post_id)

    post.campaign_id = campaign.id
    db.commit()
    db.refresh(post)


def assign_post_to_campaign(campaign_id: int, post_id: int):
    """Assign a post to a campaign."""
    return {
        "message": "Post assigned to campaign successfully",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Assigned",
    }


def remove_post_from_campaign(db: Session, user_id: int, campaign_id: int, post_id: int):
    _get_owned_campaign(db, user_id, campaign_id)
    post = _get_owned_post(db, user_id, post_id)

    post.campaign_id = None
    db.commit()
    db.refresh(post)

    return {
        "message": "Post removed from campaign successfully",
        "campaign_id": campaign_id,
        "post_id": post_id,
        "status": "Removed",
    }


def get_campaign_timeline(db: Session, user_id: int, campaign_id: int):
    campaign = _get_owned_campaign(db, user_id, campaign_id)

    posts = (
        db.query(Post)
        .filter(Post.campaign_id == campaign.id)
        .order_by(Post.scheduled_for.asc())
        .all()
    )

    timeline = [
        {
            "date": campaign.created_at.date().isoformat(),
            "event": "Campaign Created",
        }
    ]

    for post in posts:
        timeline.append(
            {
                "date": (
                    post.scheduled_for.date().isoformat()
                    if post.scheduled_for
                    else "unscheduled"
                ),
                "event": f"Post '{post.title or post.id}' scheduled ({post.status})",
            }
        )
    return {
        "message": "Campaign timeline retrieved successfully",
        "campaign_id": campaign_id,
        "timeline": timeline,
    }


def get_campaign_progress(db: Session, user_id: int, campaign_id: int):
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()

    total = len(posts)
    published = sum(1 for p in posts if p.status == "Published")
    scheduled = sum(1 for p in posts if p.status in ("Scheduled", "Queued"))
    drafts = sum(1 for p in posts if p.status == "Draft")
    completion = int((published / total) * 100) if total else 0

    return {
        "message": "Campaign progress retrieved successfully",
        "campaign_id": campaign_id,
        "progress": {
            "total_posts": total,
            "published": published,
            "scheduled": scheduled,
            "drafts": drafts,
            "completion_percentage": completion,
        },
    }


def get_campaign_summary(db: Session, user_id: int, campaign_id: int):
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    progress = get_campaign_progress(db, user_id, campaign_id)["progress"]

    return {
        "message": "Campaign summary retrieved successfully",
        "campaign_id": campaign_id,
        "summary": {
            "campaign_name": campaign.name,
            "total_posts": progress["total_posts"],
            "published_posts": progress["published"],
            "scheduled_posts": progress["scheduled"],
            "draft_posts": progress["drafts"],
            "status": campaign.status,
        },
    }


def get_campaign_analytics(campaign_id: int):
    """Retrieve campaign analytics."""

    return {
        "message": "Campaign analytics retrieved successfully",
        "campaign_id": campaign_id,
        "analytics": {
            "likes": 1200,
            "comments": 240,
            "shares": 150,
            "reach": 5000,
            "impressions": 7000,
            "engagement_rate": "8.5%"
        }
    }


def get_campaign_performance(campaign_id: int):
    """Retrieve campaign performance."""

    return {
        "message": "Campaign performance retrieved successfully",
        "campaign_id": campaign_id,
        "performance": {
            "completed_posts": 12,
            "scheduled_posts": 4,
            "failed_posts": 1
        }
    }

