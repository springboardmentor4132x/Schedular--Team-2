from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReportGenerateRequest(BaseModel):
    report_type: str  # engagement, campaign, audience, publishing, platform_comparison
    report_name: Optional[str] = None
    export_format: str = "pdf"  # pdf, excel
    campaign_id: Optional[int] = None
    platform: Optional[str] = None
    content_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class GeneratedReportResponse(BaseModel):
    id: int
    user_id: int
    report_name: str
    report_type: str
    export_format: str
    status: str
    file_location: Optional[str] = None
    download_count: int
    generated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)