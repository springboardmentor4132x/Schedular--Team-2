from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Notification type toggles
    publishing_notifications = Column(Boolean, default=True, nullable=False)
    campaign_notifications = Column(Boolean, default=True, nullable=False)
    account_notifications = Column(Boolean, default=True, nullable=False)
    collaboration_notifications = Column(Boolean, default=True, nullable=False)
    system_notifications = Column(Boolean, default=True, nullable=False)

    # Delivery channels
    in_app_notifications = Column(Boolean, default=True, nullable=False)
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=False, nullable=False)

    # Email frequency: immediate, daily, weekly
    email_frequency = Column(String(20), default="immediate", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notification_preference")