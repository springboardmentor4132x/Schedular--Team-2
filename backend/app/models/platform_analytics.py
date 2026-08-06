from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PlatformAnalytics(Base):
    __tablename__ = "platform_analytics"

    id = Column(Integer, primary_key=True, index=True)
    social_account_id = Column(Integer, ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False)
    platform_name = Column(String(50), nullable=False)

    followers = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    impressions = Column(Integer, nullable=False, default=0)
    engagement = Column(Integer, nullable=False, default=0)
    clicks = Column(Integer, nullable=False, default=0)

    snapshot_date = Column(Date, nullable=False, index=True)
    last_synced = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    social_account = relationship("SocialAccount", backref="platform_analytics")