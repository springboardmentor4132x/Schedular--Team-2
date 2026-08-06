import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.rbac import RoleChecker
from app.database.database import get_db
from app.models.campaign import Campaign
from app.models.campaign_analytics import CampaignAnalytics
from app.models.post import Post
from app.models.post_analytics import PostAnalytics
from app.models.social_account import SocialAccount
from app.models.audience_analytics import AudienceAnalytics
from app.models.platform_analytics import PlatformAnalytics
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


# ---------------------------------------------------------
# Admin Analytics (Module 6 — platform-wide)
# ---------------------------------------------------------

def _platform_account_aggregate(db: Session, account):
    post_stats = (
        db.query(
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.impressions), 0),
            func.coalesce(func.sum(PostAnalytics.likes), 0),
            func.coalesce(func.sum(PostAnalytics.comments), 0),
            func.coalesce(func.sum(PostAnalytics.shares), 0),
            func.coalesce(func.sum(PostAnalytics.clicks), 0),
        )
        .filter(PostAnalytics.platform == account.platform)
        .join(Post, Post.id == PostAnalytics.post_id)
        .filter(Post.user_id == account.user_id)
        .first()
    )
    reach, impressions, likes, comments, shares, clicks = post_stats
    return {
        "reach": reach,
        "impressions": impressions,
        "engagement": likes + comments + shares,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "clicks": clicks,
    }


@router.get("/analytics/summary")
def admin_analytics_summary(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Platform-wide KPI summary + 30-day trend + platform growth for admin analytics."""
    since = date.today() - timedelta(days=29)

    total_creators = db.query(User).filter(User.role == "creator").count()
    total_campaigns = db.query(Campaign).count()
    total_published = db.query(Post).filter(Post.status == "Published").count()
    total_scheduled = db.query(Post).filter(Post.status == "Scheduled").count()

    totals = (
        db.query(
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.impressions), 0),
            func.coalesce(func.sum(PostAnalytics.likes), 0),
            func.coalesce(func.sum(PostAnalytics.comments), 0),
            func.coalesce(func.sum(PostAnalytics.shares), 0),
            func.coalesce(func.sum(PostAnalytics.clicks), 0),
        )
        .first()
    )
    reach, impressions, likes, comments, shares, clicks = totals
    engagement = likes + comments + shares
    total_followers = (
        db.query(func.coalesce(func.sum(SocialAccount.followers_count), 0)).scalar()
    )
    engagement_rate = round((engagement / impressions) * 100, 2) if impressions > 0 else 0.0

    kpis = {
        "totalCreators": {"label": "Total Creators", "value": total_creators, "change": 0, "positive": True},
        "totalCampaigns": {"label": "Total Campaigns", "value": total_campaigns, "change": 0, "positive": True},
        "totalPublished": {"label": "Published Posts", "value": total_published, "change": 0, "positive": True},
        "totalScheduled": {"label": "Scheduled Posts", "value": total_scheduled, "change": 0, "positive": True},
        "totalReach": {"label": "Total Reach", "value": reach, "change": 0, "positive": True},
        "totalImpressions": {"label": "Total Impressions", "value": impressions, "change": 0, "positive": True},
        "totalEngagement": {"label": "Total Engagement", "value": engagement, "change": 0, "positive": True},
        "totalFollowers": {"label": "Total Followers", "value": total_followers, "change": 0, "positive": True},
        "overallEngagementRate": {"label": "Engagement Rate", "value": engagement_rate, "change": 0, "positive": True},
    }

    day_rows = (
        db.query(
            func.date_trunc("day", Post.published_at).label("day"),
            func.coalesce(func.sum(PostAnalytics.engagement_rate), 0),
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.count(Post.id),
        )
        .join(PostAnalytics, PostAnalytics.post_id == Post.id)
        .filter(Post.published_at >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    creators_by_day = dict(
        db.query(func.date_trunc("day", User.created_at).label("day"), func.count(User.id))
        .filter(User.role == "creator", User.created_at >= since)
        .group_by("day")
        .all()
    )
    day_map = {(r[0].date().isoformat()): r for r in day_rows}
    time_series = []
    for i in range(29, -1, -1):
        d = (date.today() - timedelta(days=i)).isoformat()
        row = day_map.get(d) or (None, 0, 0, 0)
        time_series.append({
            "date": d,
            "engagement": round((row[1] or 0), 2),
            "reach": row[2] or 0,
            "posts": row[3] or 0,
            "creators": creators_by_day.get(d, 0) if d in creators_by_day else 0,
        })

    platform_growth = []
    accounts = db.query(SocialAccount).all()
    for acc in accounts:
        stats = _platform_account_aggregate(db, acc)
        platform_growth.append({
            "platform": acc.platform,
            "followers": acc.followers_count or 0,
            "reach": stats["reach"],
            "engagement": stats["engagement"],
            "growth": 0,
        })

    return {"kpis": kpis, "timeSeries": time_series, "platformGrowth": platform_growth}


@router.get("/analytics/creators")
def admin_creator_performance(
    search: str = "",
    status: str = "All",
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Per-creator performance matrix for the admin panel."""
    query = db.query(User).filter(User.role == "creator")
    if search:
        query = query.filter(User.username.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    creators = query.all()

    results = []
    for c in creators:
        followers = (
            db.query(func.coalesce(func.sum(SocialAccount.followers_count), 0))
            .filter(SocialAccount.user_id == c.id)
            .scalar()
        )
        post_count = db.query(Post).filter(Post.user_id == c.id).count()
        agg = (
            db.query(
                func.coalesce(func.sum(PostAnalytics.reach), 0),
                func.coalesce(func.sum(PostAnalytics.likes), 0),
                func.coalesce(func.sum(PostAnalytics.comments), 0),
                func.coalesce(func.sum(PostAnalytics.shares), 0),
            )
            .join(Post, Post.id == PostAnalytics.post_id)
            .filter(Post.user_id == c.id)
            .first()
        )
        reach, likes, comments, shares = agg
        campaign_count = (
            db.query(func.count(func.distinct(Post.campaign_id)))
            .filter(Post.user_id == c.id, Post.campaign_id.isnot(None))
            .scalar()
        )
        name = f"{c.first_name or ''} {c.last_name or ''}".strip() or c.username
        results.append({
            "id": c.id,
            "name": name,
            "handle": c.username,
            "avatar": c.avatar_url,
            "followers": followers,
            "posts": post_count,
            "reach": reach,
            "engagement": likes + comments + shares,
            "campaigns": campaign_count,
            "status": status,
        })
    return results


@router.get("/analytics/campaigns")
def admin_campaign_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """All campaigns with completion, reach, engagement, ROI for admin analytics."""
    rows = db.query(CampaignAnalytics, Campaign).join(Campaign, Campaign.id == CampaignAnalytics.campaign_id).all()
    creator_count_map = dict(
        db.query(Post.campaign_id, func.count(func.distinct(Post.user_id)))
        .filter(Post.campaign_id.isnot(None))
        .group_by(Post.campaign_id)
        .all()
    )
    results = []
    for ca, campaign in rows:
        results.append({
            "id": ca.campaign_id,
            "name": campaign.name,
            "creatorCount": creator_count_map.get(ca.campaign_id, 0),
            "status": campaign.status,
            "completion": ca.completion_percentage,
            "reach": ca.reach,
            "impressions": ca.impressions,
            "engagement": ca.engagement,
            "clicks": ca.clicks,
            "roi": ca.roi,
        })
    return results


@router.get("/analytics/platforms")
def admin_platform_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Platform-level aggregates for the admin comparison dashboard."""
    accounts = db.query(SocialAccount).all()
    results = []
    for acc in accounts:
        stats = _platform_account_aggregate(db, acc)
        results.append({
            "platform": acc.platform,
            "followers": acc.followers_count or 0,
            "reach": stats["reach"],
            "engagement": stats["engagement"],
            "growth": 0,
        })
    return results


@router.get("/analytics/audience")
def admin_audience_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Aggregated platform-wide audience demographics."""
    rows = db.query(AudienceAnalytics).all()

    def merge_json(text):
        try:
            return json.loads(text) if text else []
        except (TypeError, ValueError):
            return []

    gender_map, age_map, country_map, language_map = {}, {}, {}, {}
    total_weight = sum(r.followers or 0 for r in rows) or 1
    for r in rows:
        weight = (r.followers or 0) / total_weight
        for item in merge_json(r.gender_distribution):
            label = item.get("label", item.get("name", "Unknown"))
            gender_map[label] = gender_map.get(label, 0) + (item.get("percentage", 0) * weight)
        for item in merge_json(r.age_distribution):
            group = item.get("group", item.get("range", item.get("age", "Unknown")))
            age_map[group] = age_map.get(group, 0) + (item.get("percentage", 0) * weight)
        for item in merge_json(r.country_distribution):
            country = item.get("country", "Unknown")
            entry = country_map.setdefault(country, {"country": country, "percentage": 0, "count": 0})
            entry["percentage"] += item.get("percentage", 0) * weight
            entry["count"] += item.get("count", 0)
        for item in merge_json(r.language_distribution):
            lang = item.get("language", "Unknown")
            language_map[lang] = language_map.get(lang, 0) + (item.get("percentage", 0) * weight)

    return {
        "age": [{"range": k, "percentage": round(v, 1)} for k, v in sorted(age_map.items())],
        "gender": [{"label": k, "percentage": round(v, 1)} for k, v in sorted(gender_map.items())],
        "countries": sorted(country_map.values(), key=lambda c: c["percentage"], reverse=True)[:10],
        "languages": [{"language": k, "percentage": round(v, 1)} for k, v in sorted(language_map.items(), key=lambda x: -x[1])][:6],
        "activeHoursPeak": "18:00 - 21:00",
        "activeDaysPeak": "Weekend",
    }


@router.get("/analytics/trends")
def admin_performance_trends(
    timeframe: str = Query("monthly", description="daily, weekly, monthly, quarterly, yearly"),
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Platform performance trends bucketed by timeframe for admin charts."""
    trunc_map = {
        "daily": "day",
        "weekly": "week",
        "monthly": "month",
        "quarterly": "quarter",
        "yearly": "year",
    }
    trunc = trunc_map.get(timeframe, "month")
    rows = (
        db.query(
            func.date_trunc(trunc, Post.published_at).label("bucket"),
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.likes + PostAnalytics.comments + PostAnalytics.shares), 0),
            func.count(func.distinct(Post.id)),
        )
        .join(PostAnalytics, PostAnalytics.post_id == Post.id)
        .filter(Post.published_at.isnot(None))
        .group_by("bucket")
        .order_by("bucket")
        .all()
    )
    return [
        {
            "label": r[0].isoformat() if r[0] else "",
            "engagement": r[2],
            "reach": r[1],
            "posts": r[3],
        }
        for r in rows
    ]
