from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SocialAccountBase(BaseModel):
    platform: str


class SocialAccountConnect(SocialAccountBase):
    pass


class SocialAccountResponse(SocialAccountBase):
    id: int
    user_id: int

    platform_user_id: Optional[str] = None
    username: Optional[str] = None
    profile_image: Optional[str] = None

    followers_count: Optional[int] = None

    status: str
    health: str

    connected_since: Optional[datetime] = None
    last_sync: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True