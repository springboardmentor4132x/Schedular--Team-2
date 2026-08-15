from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------
# Enums — mirror the DB's string-based status columns exactly
# ---------------------------------------------------------

class PostPublishingStatus(str, Enum):
    draft = "Draft"
    scheduled = "Scheduled"
    queued = "Queued"
    publishing = "Publishing"
    published = "Published"
    failed = "Failed"
    cancelled = "Cancelled"


class QueueProcessingStatus(str, Enum):
    pending = "Pending"
    processing = "Processing"
    completed = "Completed"
    failed = "Failed"
    cancelled = "Cancelled"


class LogStatus(str, Enum):
    published = "Published"
    failed = "Failed"
    retrying = "Retrying"


# ---------------------------------------------------------
# Publishing Queue
# ---------------------------------------------------------

class PublishingQueueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    scheduled_time: datetime
    processing_status: QueueProcessingStatus
    execution_priority: int
    retry_count: int
    max_retries: int
    created_at: datetime
    updated_at: datetime


class QueueRescheduleRequest(BaseModel):
    scheduled_time: datetime


class QueueActionResponse(BaseModel):
    message: str
    queue_id: int
    processing_status: QueueProcessingStatus


# ---------------------------------------------------------
# Publishing Logs
# ---------------------------------------------------------

class PublishingLogOut(BaseModel):
    id: int
    post_id: Optional[int]
    platform: str
    status: LogStatus
    retry_count: int
    created_at: datetime

    # These are parsed out of the `response` JSON blob at the
    # service layer, since the finalized schema only stores `response`.
    platform_post_id: Optional[str] = None
    failure_reason: Optional[str] = None
    raw_response: Optional[str] = None


# ---------------------------------------------------------
# Publishing Dashboard
# ---------------------------------------------------------

class PublishingDashboardSummary(BaseModel):
    total_scheduled: int
    total_published: int
    total_queued: int
    total_failed: int


class PublishingDashboardPost(BaseModel):
    id: int
    title: Optional[str]
    caption: Optional[str]
    content_type: str
    platforms: List[str]
    scheduled_for: Optional[datetime]
    status: PostPublishingStatus


class PublishingDashboardResponse(BaseModel):
    summary: PublishingDashboardSummary
    posts: List[PublishingDashboardPost]


# ---------------------------------------------------------
# Failed Posts
# ---------------------------------------------------------

class FailedPostOut(BaseModel):
    id: int
    title: Optional[str]
    platforms: List[str]
    failure_reason: Optional[str]
    retry_count: int
    scheduled_for: Optional[datetime]
    status: PostPublishingStatus


class RetryResponse(BaseModel):
    message: str
    post_id: int
    status: PostPublishingStatus


# ---------------------------------------------------------
# Platform Publishing History
# ---------------------------------------------------------

class PlatformHistoryItem(BaseModel):
    post_id: int
    platform: str
    published_at: Optional[datetime]
    status: PostPublishingStatus
    platform_post_id: Optional[str]
    api_response: Optional[str]


# ---------------------------------------------------------
# Module 5 — canonical /publish/* surface
# ---------------------------------------------------------

class PublishReadyItem(BaseModel):
    id: int
    title: Optional[str]
    caption: Optional[str]
    platforms: List[str]
    content_type: str
    scheduled_for: Optional[datetime]
    status: PostPublishingStatus


class PublishOutcome(BaseModel):
    published: int
    failed: int
    total: int
    platform_post_id: Optional[str]
    failure_reason: Optional[str]


class PublishLogEntry(BaseModel):
    id: int
    platform: str
    status: str
    retry_count: int = 0
    failure_reason: Optional[str] = None
    platform_post_id: Optional[str] = None
    created_at: Optional[datetime] = None


class PublishPublishResponse(BaseModel):
    message: str
    post_id: int
    status: PostPublishingStatus
    summary: Optional[PublishOutcome] = None
    logs: List[PublishLogEntry] = Field(default_factory=list)