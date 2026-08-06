from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.post import PostResponse


class PublishingDashboardSummary(BaseModel):
    total_scheduled: int
    total_published: int
    total_queued: int
    total_failed: int


class PublishingDashboardPost(PostResponse):
    """Extends PostResponse with resolved platform names for display."""
    platforms: List[str] = Field(default_factory=list)


class PublishingDashboardResponse(BaseModel):
    summary: PublishingDashboardSummary
    posts: List[PublishingDashboardPost]


class FailedPostOut(PostResponse):
    """Extends PostResponse — same shape, used specifically on the Failed Posts page."""
    platforms: List[str] = Field(default_factory=list)


class RetryResponse(BaseModel):
    message: str
    post_id: int
    status: str


class PlatformHistoryItem(BaseModel):
    post_id: int
    platform: str
    published_at: Optional[datetime]
    status: str
    platform_post_id: Optional[str]
    api_response: Optional[str]