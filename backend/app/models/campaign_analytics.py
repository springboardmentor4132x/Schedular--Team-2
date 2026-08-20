from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class CampaignAnalytics(Base):
    __tablename__ = "campaign_analytics"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), unique=True, nullable=False)

    total_posts = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    impressions = Column(Integer, nullable=False, default=0)
    engagement = Column(Integer, nullable=False, default=0)
    clicks = Column(Integer, nullable=False, default=0)
    roi = Column(Float, nullable=False, default=0.0)
    completion_percentage = Column(Float, nullable=False, default=0.0)

    last_synced = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign = relationship("Campaign", backref="analytics")