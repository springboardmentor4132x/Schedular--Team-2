from pydantic import BaseModel
from typing import Optional

class UserSettingsBase(BaseModel):
    # Notification Settings
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    marketing_emails: Optional[bool] = False
    product_updates: Optional[bool] = True
    weekly_summary: Optional[bool] = True
    security_alerts: Optional[bool] = True
    
    # Security Settings
    two_factor_auth: Optional[bool] = False
    remember_device: Optional[bool] = True
    login_alerts: Optional[bool] = True
    session_timeout: Optional[bool] = False
    
    # Privacy Settings
    public_profile: Optional[bool] = True
    show_email: Optional[bool] = False
    show_activity_status: Optional[bool] = True
    allow_search_engines: Optional[bool] = True
    
    # Regional Settings
    language: Optional[str] = "en"
    timezone: Optional[str] = "UTC-8"
    date_format: Optional[str] = "MM/DD/YYYY"
    time_format: Optional[str] = "12h"

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
