from pydantic import BaseModel


class PublishingLogCreate(BaseModel):
    post_id: int
    platform: str
    status: str
    response: str
    retry_count: int = 0


class PublishingLogResponse(PublishingLogCreate):
    id: int

    class Config:
        from_attributes = True