from pydantic import BaseModel


class LinkedInPostRequest(BaseModel):
    access_token: str
    author_id: str
    message: str