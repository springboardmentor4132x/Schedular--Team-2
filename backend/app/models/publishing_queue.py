from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class PublishingQueue(Base):
    __tablename__ = "publishing_queue"

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
    )

    scheduled_time = Column(DateTime(timezone=True), nullable=False)

    processing_status = Column(
        String(30),
        nullable=False,
        default="Pending",
        index=True,
    )  # Pending, Processing, Completed, Failed, Cancelled

    execution_priority = Column(Integer, nullable=False, default=0)

    retry_count = Column(Integer, nullable=False, default=0)
    max_retries = Column(Integer, nullable=False, default=3)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    post = relationship("Post", back_populates="publishing_queue_entries")

    __table_args__ = (
        Index("idx_queue_polling", "processing_status", "scheduled_time"),
    )