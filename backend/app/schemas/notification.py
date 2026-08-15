from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    read: bool
    category: str = "system"
    delivery_channel: str = "in_app"
    read_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    publishing_notifications: bool
    campaign_notifications: bool
    account_notifications: bool
    collaboration_notifications: bool
    system_notifications: bool
    in_app_notifications: bool
    email_notifications: bool
    push_notifications: bool
    email_frequency: str

    model_config = ConfigDict(from_attributes=True)


class NotificationPreferenceUpdate(BaseModel):
    publishing_notifications: Optional[bool] = None
    campaign_notifications: Optional[bool] = None
    account_notifications: Optional[bool] = None
    collaboration_notifications: Optional[bool] = None
    system_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    email_frequency: Optional[str] = None


class TeamActivityResponse(BaseModel):
    id: int
    title: str
    message: Optional[str] = None
    category: str
    created_at: Optional[datetime] = None