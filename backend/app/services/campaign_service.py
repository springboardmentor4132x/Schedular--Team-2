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


def get_campaign_analytics(db: Session, user_id: int, campaign_id: int):
    """Retrieve campaign analytics from DB or return calculated metrics."""
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()

    total = len(posts)
    published = sum(1 for p in posts if p.status == "Published")

    # Try to get real analytics from post_analytics table
    try:
        from app.models.post_analytics import PostAnalytics
        from sqlalchemy import func

        post_ids = [p.id for p in posts]
        if post_ids:
            totals = db.query(
                func.coalesce(func.sum(PostAnalytics.likes), 0),
                func.coalesce(func.sum(PostAnalytics.comments), 0),
                func.coalesce(func.sum(PostAnalytics.shares), 0),
                func.coalesce(func.sum(PostAnalytics.reach), 0),
                func.coalesce(func.sum(PostAnalytics.impressions), 0),
                func.coalesce(func.sum(PostAnalytics.clicks), 0),
            ).filter(PostAnalytics.post_id.in_(post_ids)).first()

            likes, comments, shares, reach, impressions, clicks = totals
        else:
            likes = comments = shares = reach = impressions = clicks = 0

        engagement = likes + comments + shares
        engagement_rate = f"{round((engagement / impressions) * 100, 2)}%" if impressions > 0 else "0%"
        completion = round((published / total) * 100, 2) if total > 0 else 0.0

    except Exception:
        likes = comments = shares = reach = impressions = clicks = 0
        engagement_rate = "0%"
        completion = 0.0

    return {
        "message": "Campaign analytics retrieved successfully",
        "campaign_id": campaign_id,
        "campaign_name": campaign.name,
        "analytics": {
            "total_posts": total,
            "published_posts": published,
            "completion_percentage": completion,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "reach": reach,
            "impressions": impressions,
            "clicks": clicks,
            "engagement_rate": engagement_rate,
        }
    }


def get_campaign_performance(db: Session, user_id: int, campaign_id: int):
    """Retrieve campaign performance."""
    campaign = _get_owned_campaign(db, user_id, campaign_id)
    posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()

    return {
        "message": "Campaign performance retrieved successfully",
        "campaign_id": campaign_id,
        "performance": {
            "completed_posts": sum(1 for p in posts if p.status == "Published"),
            "scheduled_posts": sum(1 for p in posts if p.status in ("Scheduled", "Queued")),
            "failed_posts": sum(1 for p in posts if p.status == "Failed"),
            "draft_posts": sum(1 for p in posts if p.status == "Draft"),
        }
    }

