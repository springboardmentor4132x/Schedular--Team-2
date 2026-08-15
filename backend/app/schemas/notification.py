from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    read: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
