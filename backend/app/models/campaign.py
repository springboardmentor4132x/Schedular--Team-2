from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
)
from sqlalchemy.sql import func

from app.database.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True)

    campaign_name = Column(String(255))

    platform = Column(String(50))

    budget = Column(Float)

    objective = Column(String(255))

    start_date = Column(
        DateTime(timezone=True)
    )

    end_date = Column(
        DateTime(timezone=True)
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )