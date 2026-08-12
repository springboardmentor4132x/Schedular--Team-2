from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.dependencies import get_current_user, verify_workspace_access
from app.models.user import User

from app.schemas.analytics import (
    PostAnalyticsResponse,
    AudienceAnalyticsResponse,
    CampaignAnalyticsResponse,
    PlatformComparisonItem,
    DashboardResponse,
    DashboardSummary,
    PerformanceTrendsResponse,
    AnalyticsMetricResponse,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------- Dashboard ----------------

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    summary = analytics_service.get_dashboard_summary(db, current_user.id, workspace_id)
    trends = analytics_service.get_performance_trends(db, current_user.id, granularity="daily")
    top, lowest = analytics_service.get_top_bottom_posts(db, current_user.id, workspace_id=workspace_id)
    recent = analytics_service.get_recent_posts(db, current_user.id, workspace_id=workspace_id)

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
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    platform: Optional[str] = None,
    campaign_id: Optional[int] = None,
    content_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: Optional[str] = Query(None, description="engagement or reach"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    return analytics_service.get_content_analytics(
        db, current_user.id, platform, campaign_id, content_type, start_date, end_date,
        sort_by, workspace_id,
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
            language_distribution=r.language_distribution,
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
# GET /analytics/platforms (spec) and /analytics/platforms/compare (legacy)

@router.get("/platforms", response_model=list[PlatformComparisonItem])
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


# ---------------- Metric Analytics (spec endpoints) ----------------
# GET /analytics/engagement | /followers | /reach | /impressions | /clicks

_METRIC_DESCRIPTIONS = {
    "engagement": "Aggregated engagement (likes + comments + shares) with platform breakdown and trend.",
    "followers": "Follower totals per platform with growth metrics and daily trend.",
    "reach": "Aggregated reach with platform breakdown and daily trend.",
    "impressions": "Aggregated impressions with platform breakdown and daily trend.",
    "clicks": "Aggregated clicks with platform breakdown and daily trend.",
}


def _register_metric_endpoint(metric: str, description: str):
    @router.get(f"/{metric}", name=f"{metric}_analytics", response_model=AnalyticsMetricResponse)
    def metric_analytics(
        workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
        platform: Optional[str] = Query(None, description="Filter by platform"),
        campaign_id: Optional[int] = Query(None, description="Filter by campaign"),
        content_type: Optional[str] = Query(None, description="Filter by content type"),
        start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ):
        if workspace_id is not None:
            verify_workspace_access(db, workspace_id, current_user)
        return analytics_service.get_metric_analytics(
            db, current_user.id, metric,
            platform, campaign_id, content_type, start_date, end_date, workspace_id,
        )

    metric_analytics.__doc__ = description


for _metric, _desc in _METRIC_DESCRIPTIONS.items():
    _register_metric_endpoint(_metric, _desc)