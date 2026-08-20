from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base


class TeamRequest(Base):
    """A business user's request to connect a marketing team.

    The business user cannot assign a marketing team directly. Instead they
    submit a request that the marketing team must approve (or reject). Only an
    approved request creates an active membership, enforcing one business user
    to one marketing team while a team can manage many business users.
    """
    __tablename__ = "team_requests"

    id = Column(Integer, primary_key=True, index=True)
    business_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    marketing_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 'Pending', 'Approved', 'Rejected', 'Cancelled'
    status = Column(String(20), nullable=False, default="Pending")
    decision_note = Column(String(1000), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    business_user = relationship("User", foreign_keys=[business_user_id])
    marketing_user = relationship("User", foreign_keys=[marketing_user_id])
