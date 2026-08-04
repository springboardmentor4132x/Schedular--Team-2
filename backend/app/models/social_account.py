from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.database.database import Base


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Platform information
    platform = Column(
        String(50),
        nullable=False,
    )  # instagram, facebook, linkedin, twitter, youtube, pinterest

    platform_user_id = Column(
        String(255),
        nullable=True,
    )

    username = Column(
        String(100),
        nullable=True,
    )

    profile_image = Column(
        String(500),
        nullable=True,
    )

    followers_count = Column(
        Integer,
        nullable=True,
    )

    # OAuth tokens
    access_token = Column(
        String(1000),
        nullable=False,
    )

    refresh_token = Column(
        String(1000),
        nullable=True,
    )

    token_expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Account status
    status = Column(
        String(50),
        default="Connected",
    )

    health = Column(
        String(50),
        default="Healthy",
    )

   

    # Tracking information
    connected_since = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_sync = Column(
        DateTime(timezone=True),
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

    # Relationships
    user = relationship(
        "User",
        back_populates="social_accounts",
    )

    posts = relationship(
        "Post",
        secondary="post_social_accounts",
        back_populates="social_accounts",
   )