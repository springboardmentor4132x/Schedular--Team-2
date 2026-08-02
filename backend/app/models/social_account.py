from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    platform = Column(String(50), nullable=False)

    account_id = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)

    access_token = Column(String(500), nullable=True)
    refresh_token = Column(String(500), nullable=True)

    expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )