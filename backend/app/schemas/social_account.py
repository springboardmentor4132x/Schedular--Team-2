from datetime import datetime
from pydantic import BaseModel


class SocialAccountResponse(BaseModel):
    id: int
    user_id: int
    platform: str
    account_id: str | None = None
    account_name: str | None = None
    expires_at: datetime | None = None

    class Config:
        from_attributes = True