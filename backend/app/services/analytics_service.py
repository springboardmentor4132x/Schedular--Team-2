from datetime import datetime, timedelta, timezone
from typing import Optional, List

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.campaign import Campaign
from app.models.post_analytics import PostAnalytics
from app.models.audience_analytics import AudienceAnalytics
from app.models.campaign_analytics import CampaignAnalytics
from app.models.platform_analytics import PlatformAnalytics


# ---------------------------------------------------------
# Shared filter helper
# ---------------------------------------------------------

def _apply_post_filters(query, user_id: int, platform: Optional[str], campaign_id: Optional[int],
                         content_type: Optional[str], start_date, end_date,
                         workspace_id: Optional[int] = None):
    query = query.join(Post, Post.id == PostAnalytics.post_id).filter(Post.user_id == user_id)
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    if platform:
        query = query.filter(PostAnalytics.platform == platform)
    if campaign_id:
        query = query.filter(Post.campaign_id == campaign_id)
    if content_type:
        query = query.filter(Post.content_type == content_type)
    if start_date:
        query = query.filter(Post.published_at >= start_date)
    if end_date:
        query = query.filter(Post.published_at <= end_date)
    return query


def _to_post_analytics_response(pa: PostAnalytics, post: Post, campaign_name: Optional[str] = None) -> dict:
    return {
        "post_id": pa.post_id,
        "platform": pa.platform,
        "caption": post.caption,
        "content_type": post.content_type,
        "campaign_name": campaign_name,
        "published_at": post.published_at,
        "likes": pa.likes,
        "comments": pa.comments,
        "shares": pa.shares,
        "saves": pa.saves,
        "reach": pa.reach,
        "impressions": pa.impressions,
        "clicks": pa.clicks,
        "engagement_rate": pa.engagement_rate,
    }


# ---------------------------------------------------------
# 1. Content Analytics (list + filters)
# ---------------------------------------------------------

def get_content_analytics(
    db: Session, user_id: int,
    platform: Optional[str] = None, campaign_id: Optional[int] = None,
    content_type: Optional[str] = None, start_date=None, end_date=None,
    sort_by: Optional[str] = None, workspace_id: Optional[int] = None,
) -> List[dict]:
    query = db.query(PostAnalytics)
    query = _apply_post_filters(
        query, user_id, platform, campaign_id, content_type, start_date, end_date, workspace_id
    )

    if sort_by == "engagement":
        query = query.order_by(PostAnalytics.engagement_rate.desc())
    elif sort_by == "reach":
        query = query.order_by(PostAnalytics.reach.desc())

    results = []
    for pa in query.all():
        post = db.query(Post).filter(Post.id == pa.post_id).first()
        campaign_name = None
        if post and post.campaign_id:
            campaign = db.query(Campaign).filter(Campaign.id == post.campaign_id).first()
            campaign_name = campaign.name if campaign else None
        results.append(_to_post_analytics_response(pa, post, campaign_name))
    return results


def get_single_post_analytics(db: Session, user_id: int, post_id: int) -> Optional[dict]:
    pa = db.query(PostAnalytics).filter(PostAnalytics.post_id == post_id).first()
    if not pa:
        return None
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
    if not post:
        return None
    campaign_name = None
    if post.campaign_id:
        campaign = db.query(Campaign).filter(Campaign.id == post.campaign_id).first()
        campaign_name = campaign.name if campaign else None
    return _to_post_analytics_response(pa, post, campaign_name)


# ---------------------------------------------------------
# 2. Audience Analytics
# ---------------------------------------------------------

def get_audience_analytics(db: Session, user_id: int, platform: Optional[str] = None) -> List[AudienceAnalytics]:
    query = (
        db.query(AudienceAnalytics)
        .join(SocialAccount, SocialAccount.id == AudienceAnalytics.social_account_id)
        .filter(SocialAccount.user_id == user_id)
    )
    if platform:
        query = query.filter(AudienceAnalytics.platform == platform)
    return query.all()


# ---------------------------------------------------------
# 3. Campaign Analytics
# ---------------------------------------------------------

def get_campaign_analytics_list(db: Session, user_id: int) -> List[dict]:
    query = (
        db.query(CampaignAnalytics, Campaign)
        .join(Campaign, Campaign.id == CampaignAnalytics.campaign_id)
        .filter(Campaign.user_id == user_id)
    )
    results = []
    for ca, campaign in query.all():
        engagement_rate = 0.0
        if ca.impressions > 0:
            engagement_rate = round((ca.engagement / ca.impressions) * 100, 2)
        results.append({
            "campaign_id": ca.campaign_id,
            "campaign_name": campaign.name,
            "status": campaign.status,
            "total_posts": ca.total_posts,
            "reach": ca.reach,
            "impressions": ca.impressions,
            "engagement": ca.engagement,
            "clicks": ca.clicks,
            "engagement_rate": engagement_rate,
            "roi": ca.roi,
            "completion_percentage": ca.completion_percentage,
        })
    return results


def get_single_campaign_analytics(db: Session, user_id: int, campaign_id: int) -> Optional[dict]:
    row = (
        db.query(CampaignAnalytics, Campaign)
        .join(Campaign, Campaign.id == CampaignAnalytics.campaign_id)
        .filter(Campaign.id == campaign_id, Campaign.user_id == user_id)
        .first()
    )
    if not row:
        return None
    ca, campaign = row
    engagement_rate = round((ca.engagement / ca.impressions) * 100, 2) if ca.impressions > 0 else 0.0
    return {
        "campaign_id": ca.campaign_id,
        "campaign_name": campaign.name,
        "status": campaign.status,
        "total_posts": ca.total_posts,
        "reach": ca.reach,
        "impressions": ca.impressions,
        "engagement": ca.engagement,
        "clicks": ca.clicks,
        "engagement_rate": engagement_rate,
        "roi": ca.roi,
        "completion_percentage": ca.completion_percentage,
    }


def get_top_campaigns(db: Session, user_id: int, limit: int = 5) -> List[dict]:
    all_campaigns = get_campaign_analytics_list(db, user_id)
    return sorted(all_campaigns, key=lambda c: c["engagement"], reverse=True)[:limit]


# ---------------------------------------------------------
# 4. Platform Comparison
# ---------------------------------------------------------

def get_platform_comparison(db: Session, user_id: int) -> List[dict]:
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
    results = []
    for acc in accounts:
        post_stats = (
            db.query(
                func.coalesce(func.sum(PostAnalytics.reach), 0),
                func.coalesce(func.sum(PostAnalytics.impressions), 0),
                func.coalesce(func.sum(PostAnalytics.likes), 0),
                func.coalesce(func.sum(PostAnalytics.comments), 0),
                func.coalesce(func.sum(PostAnalytics.shares), 0),
                func.coalesce(func.sum(PostAnalytics.clicks), 0),
            )
            .filter(PostAnalytics.platform == acc.platform)
            .join(Post, Post.id == PostAnalytics.post_id)
            .filter(Post.user_id == user_id)
            .first()
        )
        reach, impressions, likes, comments, shares, clicks = post_stats
        engagement = likes + comments + shares

        results.append({
            "platform": acc.platform,
            "followers": acc.followers_count or 0,
            "reach": reach,
            "impressions": impressions,
            "engagement": engagement,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "clicks": clicks,
        })
    return results


# ---------------------------------------------------------
# 5. Dashboard Summary
# ---------------------------------------------------------

def get_dashboard_summary(db: Session, user_id: int, workspace_id: Optional[int] = None) -> dict:
    def _post_query():
        query = db.query(Post).filter(Post.user_id == user_id)
        if workspace_id is not None:
            query = query.filter(Post.workspace_id == workspace_id)
        return query

    published = _post_query().filter(Post.status == "Published").count()
    scheduled = _post_query().filter(Post.status == "Scheduled").count()

    totals_query = db.query(PostAnalytics).join(Post, Post.id == PostAnalytics.post_id).filter(
        Post.user_id == user_id
    )
    if workspace_id is not None:
        totals_query = totals_query.filter(Post.workspace_id == workspace_id)
    totals = totals_query.with_entities(
        func.coalesce(func.sum(PostAnalytics.impressions), 0),
        func.coalesce(func.sum(PostAnalytics.reach), 0),
        func.coalesce(func.sum(PostAnalytics.likes), 0),
        func.coalesce(func.sum(PostAnalytics.comments), 0),
        func.coalesce(func.sum(PostAnalytics.shares), 0),
        func.coalesce(func.sum(PostAnalytics.clicks), 0),
    ).first()
    impressions, reach, likes, comments, shares, clicks = totals
    engagement = likes + comments + shares

    # Social accounts are user-level (no workspace linkage), so follower totals
    # stay account-wide even when a workspace filter is applied.
    followers = (
        db.query(func.coalesce(func.sum(SocialAccount.followers_count), 0))
        .filter(SocialAccount.user_id == user_id)
        .scalar()
    )

    engagement_rate = round((engagement / impressions) * 100, 2) if impressions > 0 else 0.0

    return {
        "total_published_posts": published,
        "total_scheduled_posts": scheduled,
        "total_impressions": impressions,
        "total_reach": reach,
        "total_engagement": engagement,
        "total_likes": likes,
        "total_comments": comments,
        "total_shares": shares,
        "total_clicks": clicks,
        "total_followers": followers,
        "overall_engagement_rate": engagement_rate,
    }


def get_top_bottom_posts(db: Session, user_id: int, limit: int = 5,
                         workspace_id: Optional[int] = None):
    all_posts = get_content_analytics(db, user_id, sort_by="engagement", workspace_id=workspace_id)
    top = all_posts[:limit]
    lowest = list(reversed(all_posts))[:limit]
    return top, lowest


def get_recent_posts(db: Session, user_id: int, limit: int = 5,
                     workspace_id: Optional[int] = None):
    query = db.query(Post).filter(Post.user_id == user_id, Post.status == "Published")
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    posts = query.order_by(Post.published_at.desc()).limit(limit).all()
    results = []
    for post in posts:
        pa = db.query(PostAnalytics).filter(PostAnalytics.post_id == post.id).first()
        if pa:
            campaign_name = None
            if post.campaign_id:
                campaign = db.query(Campaign).filter(Campaign.id == post.campaign_id).first()
                campaign_name = campaign.name if campaign else None
            results.append(_to_post_analytics_response(pa, post, campaign_name))
    return results


# ---------------------------------------------------------
# 6. Performance Trends (daily/weekly/monthly/quarterly/yearly)
# ---------------------------------------------------------

def get_performance_trends(db: Session, user_id: int, granularity: str = "daily", days: int = 30) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=days)

    accounts = db.query(SocialAccount.id).filter(SocialAccount.user_id == user_id).subquery()

    rows = (
        db.query(PlatformAnalytics)
        .filter(
            PlatformAnalytics.social_account_id.in_(db.query(accounts.c.id)),
            PlatformAnalytics.snapshot_date >= since.date(),
        )
        .order_by(PlatformAnalytics.snapshot_date.asc())
        .all()
    )

    engagement_trend, reach_trend, impressions_trend, clicks_trend, followers_trend = [], [], [], [], []
    for row in rows:
        day_str = row.snapshot_date.isoformat()
        engagement_trend.append({"date": day_str, "value": row.engagement})
        reach_trend.append({"date": day_str, "value": row.reach})
        impressions_trend.append({"date": day_str, "value": row.impressions})
        clicks_trend.append({"date": day_str, "value": row.clicks})
        followers_trend.append({"date": day_str, "value": row.followers})

    return {
        "granularity": granularity,
        "engagement_trend": engagement_trend,
        "reach_trend": reach_trend,
        "impressions_trend": impressions_trend,
        "clicks_trend": clicks_trend,
        "followers_trend": followers_trend,
    }


# ---------------------------------------------------------
# 7. Metric Analytics (engagement / followers / reach /
#    impressions / clicks) — the /analytics/* spec endpoints
# ---------------------------------------------------------

_METRIC_COLUMNS = {
    "engagement": PostAnalytics.likes + PostAnalytics.comments + PostAnalytics.shares,
    "reach": PostAnalytics.reach,
    "impressions": PostAnalytics.impressions,
    "clicks": PostAnalytics.clicks,
}

_TREND_COLUMNS = {
    "engagement": PlatformAnalytics.engagement,
    "reach": PlatformAnalytics.reach,
    "impressions": PlatformAnalytics.impressions,
    "clicks": PlatformAnalytics.clicks,
    "followers": PlatformAnalytics.followers,
}


def get_metric_analytics(
    db: Session, user_id: int, metric: str,
    platform: Optional[str] = None, campaign_id: Optional[int] = None,
    content_type: Optional[str] = None, start_date=None, end_date=None,
    workspace_id: Optional[int] = None,
) -> dict:
    """Aggregate a single metric (engagement/followers/reach/impressions/clicks)
    with optional filters, a per-platform breakdown, and a daily trend."""
    metric = (metric or "engagement").lower()

    if metric == "followers":
        # Social accounts have no workspace linkage — follower totals stay
        # user-wide even when a workspace filter is requested.
        return _get_followers_analytics(db, user_id, platform, start_date, end_date, workspace_id)

    if metric not in _METRIC_COLUMNS:
        raise ValueError(f"Unsupported analytics metric: {metric}")

    column = _METRIC_COLUMNS[metric]
    base = db.query(PostAnalytics.platform, func.coalesce(func.sum(column), 0))
    base = _apply_post_filters(
        base, user_id, platform, campaign_id, content_type, start_date, end_date, workspace_id
    )
    rows = base.group_by(PostAnalytics.platform).all()

    by_platform = [{"platform": p, "value": int(v)} for p, v in rows]
    total = sum(item["value"] for item in by_platform)
    trend = _get_metric_trend(db, user_id, metric, platform, start_date, end_date)

    return {"metric": metric, "total": total, "by_platform": by_platform, "trend": trend}


def _get_metric_trend(db: Session, user_id: int, metric: str, platform: Optional[str] = None,
                      start_date=None, end_date=None) -> list:
    column = _TREND_COLUMNS[metric]
    accounts = db.query(SocialAccount.id).filter(SocialAccount.user_id == user_id).subquery()
    query = (
        db.query(PlatformAnalytics.snapshot_date, func.coalesce(func.sum(column), 0))
        .filter(PlatformAnalytics.social_account_id.in_(db.query(accounts.c.id)))
        .group_by(PlatformAnalytics.snapshot_date)
        .order_by(PlatformAnalytics.snapshot_date.asc())
    )
    if platform:
        query = query.filter(PlatformAnalytics.platform_name == platform)
    if start_date:
        query = query.filter(PlatformAnalytics.snapshot_date >= start_date)
    if end_date:
        query = query.filter(PlatformAnalytics.snapshot_date <= end_date)
    return [{"date": d.isoformat(), "value": int(v)} for d, v in query.all()]


def _get_followers_analytics(db: Session, user_id: int, platform: Optional[str] = None,
                             start_date=None, end_date=None,
                             workspace_id: Optional[int] = None) -> dict:
    # workspace_id is accepted for API parity but unused: social accounts are
    # user-level and have no workspace column to filter on.
    query = db.query(SocialAccount).filter(SocialAccount.user_id == user_id)
    if platform:
        query = query.filter(SocialAccount.platform == platform)
    accounts = query.all()

    by_platform = []
    for acc in accounts:
        audience = (
            db.query(AudienceAnalytics)
            .filter(AudienceAnalytics.social_account_id == acc.id)
            .first()
        )
        by_platform.append({
            "platform": acc.platform,
            "value": acc.followers_count or 0,
            "new_followers": audience.new_followers if audience else 0,
            "lost_followers": audience.lost_followers if audience else 0,
        })
    total = sum(item["value"] for item in by_platform)
    trend = _get_metric_trend(db, user_id, "followers", platform, start_date, end_date)
    return {"metric": "followers", "total": total, "by_platform": by_platform, "trend": trend}