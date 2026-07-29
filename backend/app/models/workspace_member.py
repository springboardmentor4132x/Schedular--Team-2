from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    role = Column(String(50), nullable=False, default="Viewer") # 'Admin', 'Editor', 'Contributor', 'Viewer'
    status = Column(String(50), nullable=False, default="Active") # 'Active', 'Invited'
    
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspace_memberships")

    # Composite Unique Constraint to prevent duplicate member entries
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="unique_workspace_user"),
    )