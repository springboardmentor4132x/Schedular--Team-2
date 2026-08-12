from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import backref, relationship

from app.database.database import Base


class AudienceAnalytics(Base):
    __tablename__ = "audience_analytics"

    id = Column(Integer, primary_key=True, index=True)
    social_account_id = Column(Integer, ForeignKey("social_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    platform = Column(String(50), nullable=False)

    followers = Column(Integer, nullable=False, default=0)
    new_followers = Column(Integer, nullable=False, default=0)
    lost_followers = Column(Integer, nullable=False, default=0)

    gender_distribution = Column(Text, nullable=True)
    age_distribution = Column(Text, nullable=True)
    country_distribution = Column(Text, nullable=True)
    city_distribution = Column(Text, nullable=True)
    language_distribution = Column(Text, nullable=True)
    most_active_hours = Column(Text, nullable=True)
    most_active_days = Column(Text, nullable=True)

    last_synced = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    social_account = relationship("SocialAccount", backref=backref("audience_analytics", passive_deletes=True))