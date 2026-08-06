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
                         content_type: Optional[str], start_date, end_date):
    query = query.join(Post, Post.id == PostAnalytics.post_id).filter(Post.user_id == user_id)
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
    sort_by: Optional[str] = None,
) -> List[dict]:
    query = db.query(PostAnalytics)
    query = _apply_post_filters(query, user_id, platform, campaign_id, content_type, start_date, end_date)

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

def get_dashboard_summary(db: Session, user_id: int) -> dict:
    published = db.query(Post).filter(Post.user_id == user_id, Post.status == "Published").count()
    scheduled = db.query(Post).filter(Post.user_id == user_id, Post.status == "Scheduled").count()

    totals = (
        db.query(
            func.coalesce(func.sum(PostAnalytics.impressions), 0),
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.likes), 0),
            func.coalesce(func.sum(PostAnalytics.comments), 0),
            func.coalesce(func.sum(PostAnalytics.shares), 0),
            func.coalesce(func.sum(PostAnalytics.clicks), 0),
        )
        .join(Post, Post.id == PostAnalytics.post_id)
        .filter(Post.user_id == user_id)
        .first()
    )
    impressions, reach, likes, comments, shares, clicks = totals
    engagement = likes + comments + shares

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


def get_top_bottom_posts(db: Session, user_id: int, limit: int = 5):
    all_posts = get_content_analytics(db, user_id, sort_by="engagement")
    top = all_posts[:limit]
    lowest = list(reversed(all_posts))[:limit]
    return top, lowest


def get_recent_posts(db: Session, user_id: int, limit: int = 5):
    posts = (
        db.query(Post)
        .filter(Post.user_id == user_id, Post.status == "Published")
        .order_by(Post.published_at.desc())
        .limit(limit)
        .all()
    )
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
            PlatformAnalytics.social_account_id.in_(accounts),
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