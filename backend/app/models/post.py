from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table,Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base



# Many-to-Many Association Table
post_social_accounts = Table(
    "post_social_accounts",
    Base.metadata,
    Column(
        "post_id",
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "social_account_id",
        Integer,
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

# The business workspace this content belongs to.
    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="SET NULL"),
        nullable=True,
    )

    title = Column(String(150), nullable=True)
    caption = Column(String(2000), nullable=True)

    content_type = Column(
        String(50),
    default="text",
    )
    media_file_path = Column(String(500), nullable=True)
    status = Column(
        String(50),
        default="Draft",
        index=True,
    )

    scheduled_for = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    timezone = Column(
        String(50),
        default="UTC",
    )

    mongo_document_id = Column(
        String(100),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    published_at = Column(
         DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    failure_reason = Column(
        Text,
        nullable=True,
    )

    retry_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    platform_post_id = Column(
        String(255),
        nullable=True,
    )


    # Relationships
    user = relationship("User", back_populates="posts")
    workspace = relationship("Workspace", back_populates="posts")
    campaign = relationship("Campaign", back_populates="posts")

    social_accounts = relationship(
        "SocialAccount",
        secondary=post_social_accounts,
        back_populates="posts",
    )

    publishing_queue_entries = relationship(       
        "PublishingQueue",
        back_populates="post",
        cascade="all, delete-orphan",
    )

    publishing_logs = relationship(
        "PublishingLog",
        back_populates="post",
        primaryjoin="Post.id == PublishingLog.post_id",
        foreign_keys="PublishingLog.post_id",
    )

    api_response = Column(
    Text,
    nullable=True,
    )
