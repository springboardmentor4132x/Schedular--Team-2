from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class PublishingLog(Base):
    __tablename__ = "publishing_logs"

    id = Column(Integer, primary_key=True)

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), index=True)

    platform = Column(String(50))

    status = Column(String(50))

    response = Column(Text)

    retry_count = Column(Integer, default=0)

    failure_reason = Column(String(500), nullable=True)

    platform_post_id = Column(String(255), nullable=True)

    api_response = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    post = relationship(
        "Post",
        back_populates="publishing_logs",
        primaryjoin="PublishingLog.post_id == Post.id",
        foreign_keys="PublishingLog.post_id",
    )

    