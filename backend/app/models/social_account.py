from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    platform = Column(String(50), nullable=False) # instagram, facebook, linkedin, twitter, youtube, pinterest
    username = Column(String(100), nullable=True)
    followers_count = Column(String(50), nullable=True)
    
    # OAuth Tokens
    access_token = Column(String(1000), nullable=False)
    refresh_token = Column(String(1000), nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Connection Health
    status = Column(String(50), default="Connected") # Connected, Expired Token, Requires Login, Not Connected
    health = Column(String(50), default="Healthy") # Healthy, Fair, Action Required
    
    connected_since = Column(DateTime(timezone=True), nullable=True)
    last_sync = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="social_accounts")
    posts = relationship("Post", back_populates="social_account", cascade="all, delete-orphan")
