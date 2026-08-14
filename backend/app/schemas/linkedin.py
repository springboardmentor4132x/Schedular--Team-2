from typing import Optional
from pydantic import BaseModel


class LinkedInPostRequest(BaseModel):
    social_account_id: int
    text: str
    content_type: str = "text"  # text, image, video


class YouTubePostRequest(BaseModel):
    social_account_id: int
    title: str
    description: str = ""