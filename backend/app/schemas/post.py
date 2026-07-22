from datetime import datetime
from pydantic import BaseModel

class CreatePostRequest(BaseModel):
    title:str
    caption:str
    media_url:str | None = None
    scheduled_time: datetime |None = None
    social_accounts: list[int] | None = None
