from datetime import datetime
from pydantic import BaseModel, Field

class CreatePostRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)

    caption: str = Field(..., min_length=5, max_length=1000)

    media_url: str | None = None

    scheduled_time: datetime | None = None

    social_accounts: list[int] | None = None