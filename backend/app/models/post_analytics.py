from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PostAnalytics(Base):
    __tablename__ = "post_analytics"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    platform = Column(String(50), nullable=False)

    likes = Column(Integer, nullable=False, default=0)
    comments = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    saves = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    impressions = Column(Integer, nullable=False, default=0)
    clicks = Column(Integer, nullable=False, default=0)
    engagement_rate = Column(Float, nullable=False, default=0.0)

    last_synced = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    post = relationship("Post", backref="analytics")