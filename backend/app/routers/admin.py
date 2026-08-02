from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.rbac import RoleChecker
from app.database.database import get_db
from app.models.campaign import Campaign
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.user import User
from app.models.workspace import Workspace

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

admin_only = RoleChecker(["administrator"])


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Platform-wide summary statistics for the admin dashboard."""
    users_by_role = dict(
        db.query(User.role, func.count(User.id)).group_by(User.role).all()
    )
    accounts_by_platform = dict(
        db.query(SocialAccount.platform, func.count(SocialAccount.id))
        .group_by(SocialAccount.platform)
        .all()
    )
    campaigns_by_status = dict(
        db.query(Campaign.status, func.count(Campaign.id))
        .group_by(Campaign.status)
        .all()
    )
    posts_by_status = dict(
        db.query(Post.status, func.count(Post.id)).group_by(Post.status).all()
    )

    return {
        "total_users": sum(users_by_role.values()),
        "users_by_role": users_by_role,
        "connected_social_accounts": db.query(SocialAccount).count(),
        "accounts_by_platform": accounts_by_platform,
        "total_campaigns": db.query(Campaign).count(),
        "campaigns_by_status": campaigns_by_status,
        "running_campaigns": campaigns_by_status.get("Active", 0),
        "total_posts": db.query(Post).count(),
        "posts_by_status": posts_by_status,
        "scheduled_posts": posts_by_status.get("Scheduled", 0),
        "published_posts": posts_by_status.get("Published", 0),
        "drafts": posts_by_status.get("Draft", 0),
        "workspaces": db.query(Workspace).count(),
    }


@router.get("/activity")
def admin_activity(
    db: Session = Depends(get_db),
    limit: int = 10,
    _: User = Depends(admin_only),
):
    """Recent platform activity (registrations, connections, campaigns, posts)."""
    activities = []

    recent_users = (
        db.query(User).order_by(User.created_at.desc()).limit(5).all()
    )
    for u in recent_users:
        name = f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email
        activities.append(
            {
                "id": u.id,
                "type": "user_register",
                "event": "User Registered",
                "details": name,
                "time": u.created_at.isoformat() if u.created_at else None,
            }
        )

    recent_accounts = (
        db.query(SocialAccount)
        .order_by(SocialAccount.created_at.desc())
        .limit(5)
        .all()
    )
    for a in recent_accounts:
        owner = db.query(User).filter(User.id == a.user_id).first()
        handle = a.username or (owner.email if owner else "")
        activities.append(
            {
                "id": a.id,
                "type": "social_connect",
                "event": "Social Account Connected",
                "details": f"{a.platform} - {handle}",
                "time": a.created_at.isoformat() if a.created_at else None,
            }
        )

    recent_campaigns = (
        db.query(Campaign).order_by(Campaign.created_at.desc()).limit(5).all()
    )
    for c in recent_campaigns:
        activities.append(
            {
                "id": c.id,
                "type": "campaign_created",
                "event": "Campaign Created",
                "details": c.name,
                "time": c.created_at.isoformat() if c.created_at else None,
            }
        )

    recent_posts = (
        db.query(Post).order_by(Post.created_at.desc()).limit(5).all()
    )
    for p in recent_posts:
        activities.append(
            {
                "id": p.id,
                "type": "post_created",
                "event": "Post Created",
                "details": p.title or f"Post {p.id}",
                "time": p.created_at.isoformat() if p.created_at else None,
            }
        )

    activities.sort(key=lambda a: a["time"] or "", reverse=True)
    return {"activities": activities[:limit]}
