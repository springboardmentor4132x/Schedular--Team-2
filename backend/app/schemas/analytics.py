from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel


# ---------------- Post Analytics ----------------

class PostAnalyticsResponse(BaseModel):
    post_id: int
    platform: str
    caption: Optional[str] = None
    content_type: Optional[str] = None
    campaign_name: Optional[str] = None
    published_at: Optional[datetime] = None

    likes: int
    comments: int
    shares: int
    saves: int
    reach: int
    impressions: int
    clicks: int
    engagement_rate: float

    class Config:
        from_attributes = True


# ---------------- Audience Analytics ----------------

class AudienceAnalyticsResponse(BaseModel):
    social_account_id: int
    platform: str
    followers: int
    new_followers: int
    lost_followers: int
    net_growth: int
    gender_distribution: Optional[str] = None
    age_distribution: Optional[str] = None
    country_distribution: Optional[str] = None
    city_distribution: Optional[str] = None
    most_active_hours: Optional[str] = None
    most_active_days: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------- Campaign Analytics ----------------

class CampaignAnalyticsResponse(BaseModel):
    campaign_id: int
    campaign_name: str
    status: str
    total_posts: int
    reach: int
    impressions: int
    engagement: int
    clicks: int
    engagement_rate: float
    roi: float
    completion_percentage: float

    class Config:
        from_attributes = True


# ---------------- Platform Comparison ----------------

class PlatformComparisonItem(BaseModel):
    platform: str
    followers: int
    reach: int
    impressions: int
    engagement: int
    likes: int
    comments: int
    shares: int
    clicks: int


# ---------------- Dashboard Summary ----------------

class DashboardSummary(BaseModel):
    total_published_posts: int
    total_scheduled_posts: int
    total_impressions: int
    total_reach: int
    total_engagement: int
    total_likes: int
    total_comments: int
    total_shares: int
    total_clicks: int
    total_followers: int
    overall_engagement_rate: float


class TrendPoint(BaseModel):
    date: str
    value: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    engagement_trend: List[TrendPoint]
    reach_trend: List[TrendPoint]
    impressions_trend: List[TrendPoint]
    followers_trend: List[TrendPoint]
    recent_posts: List[PostAnalyticsResponse]
    top_posts: List[PostAnalyticsResponse]
    lowest_posts: List[PostAnalyticsResponse]


# ---------------- Performance Trends ----------------

class PerformanceTrendsResponse(BaseModel):
    granularity: str  # daily, weekly, monthly, quarterly, yearly
    engagement_trend: List[TrendPoint]
    reach_trend: List[TrendPoint]
    impressions_trend: List[TrendPoint]
    clicks_trend: List[TrendPoint]
    followers_trend: List[TrendPoint]