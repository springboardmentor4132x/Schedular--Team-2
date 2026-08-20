from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id_read", "user_id", "read"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 'success', 'error', 'info', 'campaign'
    type = Column(String(20), default="info")
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=True)

    read = Column(Boolean, default=False)

    # Dedupe key so syncing real data never recreates the same notification
    signature = Column(String(255), nullable=True, index=True)
    category = Column(String(50), default="system")  # publishing, campaign, account, collaboration, system
    read_at = Column(DateTime(timezone=True), nullable=True)
    delivery_channel = Column(String(20), default="in_app")  # in_app, email, both

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")
