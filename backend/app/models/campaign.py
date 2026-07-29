from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    
    name = Column(String(150), nullable=False)
    description = Column(String(1000), nullable=True)
    objective = Column(String(250), nullable=True)
    budget = Column(Float, default=0.0)
    priority = Column(String(50), default="Medium")  # 'Low', 'Medium', 'High'
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="Planned")  # 'Planned', 'Active', 'Completed', 'Paused'
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="campaigns")
    workspace = relationship("Workspace", back_populates="campaigns")
    posts = relationship("Post", back_populates="campaign", cascade="all, delete-orphan")