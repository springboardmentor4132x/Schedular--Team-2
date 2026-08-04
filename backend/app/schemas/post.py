from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field,field_validator


class PostCreate(BaseModel):
    workspace_id: Optional[int] = None
    title: Optional[str] = Field(default=None, max_length=150)
    caption: Optional[str] = Field(default=None, max_length=2000)
    content_type: str = Field(default="text", max_length=50)
    media_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    timezone: str = Field(default="UTC", max_length=50)
    social_account_ids: list[int] = Field(default_factory=list)
    campaign_id: Optional[int] = None
    status: str = Field(default="Draft", max_length=50)
    platform: Optional[str] = Field(default=None, max_length=50)


class PostUpdate(BaseModel):
    workspace_id: Optional[int] = None
    title: Optional[str] = Field(default=None, max_length=150)
    caption: Optional[str] = Field(default=None, max_length=2000)
    content_type: Optional[str] = Field(default=None, max_length=50)
    media_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    timezone: Optional[str] = Field(default=None, max_length=50)
    social_account_ids: Optional[list[int]] = None
    campaign_id: Optional[int] = None
    status: Optional[str] = Field(default=None, max_length=50)


class PostResponse(BaseModel):
    id: int
    user_id: int
    workspace_id: Optional[int] = None
    campaign_id: Optional[int] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    content_type: str = "text"
    media_url: Optional[str] = None
    status: str = "Draft"
    scheduled_for: Optional[datetime] = None
    timezone: str = "UTC"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    published_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    retry_count: int = 0
    platform_post_id: Optional[str] = None

    social_account_ids: list[int] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
