from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)

    report_name = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False)
    # engagement, campaign, audience, publishing, platform_comparison

    selected_filters = Column(Text, nullable=True)  # JSON string
    export_format = Column(String(10), nullable=False, default="pdf")  # pdf, excel

    status = Column(String(20), nullable=False, default="completed")
    file_location = Column(String(500), nullable=True)
    download_count = Column(Integer, nullable=False, default=0)

    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="generated_reports")