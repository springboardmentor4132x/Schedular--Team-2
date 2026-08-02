from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
)
from sqlalchemy.sql import func

from app.database.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    platform = Column(String(50), nullable=False)

    content = Column(Text, nullable=True)

    media_url = Column(String(500), nullable=True)

    status = Column(
        String(50),
        default="scheduled"
    )

    scheduled_time = Column(
        DateTime(timezone=True),
        nullable=True
    )

    published_time = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )