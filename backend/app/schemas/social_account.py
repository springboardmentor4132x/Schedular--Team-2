from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SocialAccountBase(BaseModel):
    platform: str

class SocialAccountConnect(SocialAccountBase):
    pass

class SocialAccountResponse(SocialAccountBase):
    id: int
    user_id: int
    username: Optional[str] = None
    followers_count: Optional[str] = None
    status: str
    health: str
    connected_since: Optional[datetime] = None
    last_sync: Optional[datetime] = None

    class Config:
        from_attributes = True
