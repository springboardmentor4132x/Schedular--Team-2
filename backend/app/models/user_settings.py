from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Notification Settings
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    product_updates = Column(Boolean, default=True)
    weekly_summary = Column(Boolean, default=True)
    security_alerts = Column(Boolean, default=True)
    
    # Security Settings
    two_factor_auth = Column(Boolean, default=False)
    remember_device = Column(Boolean, default=True)
    login_alerts = Column(Boolean, default=True)
    session_timeout = Column(Boolean, default=False)
    
    # Privacy Settings
    public_profile = Column(Boolean, default=True)
    show_email = Column(Boolean, default=False)
    show_activity_status = Column(Boolean, default=True)
    allow_search_engines = Column(Boolean, default=True)
    
    # Regional Settings
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC-8")
    date_format = Column(String(20), default="MM/DD/YYYY")
    time_format = Column(String(10), default="12h")

    # Relationship
    user = relationship("User", back_populates="settings")
