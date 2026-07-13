from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    social_account_id = Column(Integer, ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String(50), default="Draft") # Draft, Scheduled, Published, Failed
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    
    # Text and Media content stored in MongoDB Document Database
    mongo_document_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="posts")
    social_account = relationship("SocialAccount", back_populates="posts")
