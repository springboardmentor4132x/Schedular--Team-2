from pydantic import BaseModel, model_validator
from datetime import date
from typing import Optional

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    objective: Optional[str] = None
    budget: Optional[float] = 0.0
    priority: Optional[str] = "Medium"
    category: Optional[str] = None
    status: Optional[str] = "Planned"
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class CampaignCreate(CampaignBase):
    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("End date cannot be earlier than Start date")
        return self

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    budget: Optional[float] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("End date cannot be earlier than Start date")
        return self

class CampaignResponse(CampaignBase):
    id: int
    user_id: int
    workspace_id: Optional[int] = None

    class Config:
        from_attributes = True