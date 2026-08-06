from datetime import datetime
from pydantic import BaseModel


class PublishingQueueBase(BaseModel):
    post_id: int
    scheduled_time: datetime
    execution_priority: int = 0


class PublishingQueueCreate(PublishingQueueBase):
    pass


class PublishingQueueResponse(PublishingQueueBase):
    id: int
    processing_status: str
    retry_count: int
    max_retries: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QueueRescheduleRequest(BaseModel):
    scheduled_time: datetime


class QueueActionResponse(BaseModel):
    message: str
    queue_id: int
    processing_status: str