from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PostBase(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    caption: Optional[str] = Field(None, max_length=2000)
    content_type: Optional[str] = "text"
    media_file_path: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    timezone: Optional[str] = "UTC"
    campaign_id: Optional[int] = None
    status: Optional[str] = "Draft"

class PostCreate(PostBase):
    title: str = Field(..., min_length=3, max_length=150)
    social_account_ids: Optional[List[int]] = None

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    caption: Optional[str] = Field(None, max_length=2000)
    content_type: Optional[str] = None
    media_file_path: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    timezone: Optional[str] = None
    campaign_id: Optional[int] = None
    status: Optional[str] = None
    social_account_ids: Optional[List[int]] = None

class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    username: Optional[str] = None

    class Config:
        from_attributes = True

class PostResponse(PostBase):
    id: int
    user_id: int
    mongo_document_id: Optional[str] = None
    social_accounts: List[SocialAccountResponse] = []

    class Config:
        from_attributes = True