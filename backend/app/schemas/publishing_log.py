from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PublishingLogCreate(BaseModel):
    post_id: int
    platform: str
    status: str
    response: str
    retry_count: int = 0


class PublishingLogResponse(PublishingLogCreate):
    id: int

    class Config:
        from_attributes = True


class PublishingLogItemResponse(PublishingLogResponse):
    """Log entry enriched with post + campaign context for the publishing logs page."""
    created_at: Optional[datetime] = None
    title: Optional[str] = None
    platforms: List[str] = Field(default_factory=list)
    campaign_name: Optional[str] = None
    published_by: Optional[str] = None