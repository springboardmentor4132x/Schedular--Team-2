from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.analytics import (
    PostAnalyticsResponse,
    AudienceAnalyticsResponse,
    CampaignAnalyticsResponse,
    PlatformComparisonItem,
    DashboardResponse,
    DashboardSummary,
    PerformanceTrendsResponse,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------- Dashboard ----------------

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = analytics_service.get_dashboard_summary(db, current_user.id)
    trends = analytics_service.get_performance_trends(db, current_user.id, granularity="daily")
    top, lowest = analytics_service.get_top_bottom_posts(db, current_user.id)
    recent = analytics_service.get_recent_posts(db, current_user.id)

    return DashboardResponse(
        summary=DashboardSummary(**summary),
        engagement_trend=trends["engagement_trend"],
        reach_trend=trends["reach_trend"],
        impressions_trend=trends["impressions_trend"],
        followers_trend=trends["followers_trend"],
        recent_posts=recent,
        top_posts=top,
        lowest_posts=lowest,
    )


# ---------------- Content Analytics ----------------

@router.get("/posts", response_model=list[PostAnalyticsResponse])
def content_analytics(
    platform: Optional[str] = None,
    campaign_id: Optional[int] = None,
    content_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: Optional[str] = Query(None, description="engagement or reach"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_content_analytics(
        db, current_user.id, platform, campaign_id, content_type, start_date, end_date, sort_by
    )


@router.get("/posts/{post_id}", response_model=PostAnalyticsResponse)
def single_post_analytics(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = analytics_service.get_single_post_analytics(db, current_user.id, post_id)
    if not result:
        raise HTTPException(status_code=404, detail="Post analytics not found.")
    return result


# ---------------- Audience Analytics ----------------

@router.get("/audience", response_model=list[AudienceAnalyticsResponse])
def audience_analytics(
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = analytics_service.get_audience_analytics(db, current_user.id, platform)
    return [
        AudienceAnalyticsResponse(
            social_account_id=r.social_account_id,
            platform=r.platform,
            followers=r.followers,
            new_followers=r.new_followers,
            lost_followers=r.lost_followers,
            net_growth=r.new_followers - r.lost_followers,
            gender_distribution=r.gender_distribution,
            age_distribution=r.age_distribution,
            country_distribution=r.country_distribution,
            city_distribution=r.city_distribution,
            most_active_hours=r.most_active_hours,
            most_active_days=r.most_active_days,
        )
        for r in rows
    ]


# ---------------- Campaign Analytics ----------------

@router.get("/campaigns", response_model=list[CampaignAnalyticsResponse])
def campaign_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_campaign_analytics_list(db, current_user.id)


@router.get("/campaigns/{campaign_id}", response_model=CampaignAnalyticsResponse)
def single_campaign_analytics(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = analytics_service.get_single_campaign_analytics(db, current_user.id, campaign_id)
    if not result:
        raise HTTPException(status_code=404, detail="Campaign analytics not found.")
    return result


@router.get("/campaigns/top/list", response_model=list[CampaignAnalyticsResponse])
def top_campaigns(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_top_campaigns(db, current_user.id, limit)


# ---------------- Platform Comparison ----------------

@router.get("/platforms/compare", response_model=list[PlatformComparisonItem])
def compare_platforms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_platform_comparison(db, current_user.id)


# ---------------- Performance Trends ----------------

@router.get("/trends", response_model=PerformanceTrendsResponse)
def performance_trends(
    granularity: str = Query("daily", description="daily, weekly, monthly, quarterly, yearly"),
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_performance_trends(db, current_user.id, granularity, days)


# ---------------- Top Performing Posts ----------------

@router.get("/posts/top/list", response_model=list[PostAnalyticsResponse])
def top_posts(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    top, _ = analytics_service.get_top_bottom_posts(db, current_user.id, limit)
    return top