from datetime import datetime
from pydantic import BaseModel


class CampaignCreate(BaseModel):
    campaign_name: str
    platform: str
    budget: float
    objective: str
    start_date: datetime
    end_date: datetime


class CampaignResponse(CampaignCreate):
    id: int

    class Config:
        from_attributes = True