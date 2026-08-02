from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    objective: Optional[str] = Field(default=None, max_length=250)
    budget: float = Field(default=0.0, ge=0.0)
    priority: str = Field(default="Medium", max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    status: str = Field(default="Planned", max_length=50)
    target_platforms: List[str] = Field(default_factory=list)
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than Start date")
        return self


class CampaignCreate(CampaignBase):
    workspace_id: Optional[int] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    objective: Optional[str] = Field(default=None, max_length=250)
    budget: Optional[float] = Field(default=None, ge=0.0)
    priority: Optional[str] = Field(default=None, max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    status: Optional[str] = Field(default=None, max_length=50)
    target_platforms: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    workspace_id: Optional[int] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than Start date")
        return self


class CampaignResponse(CampaignBase):
    id: int
    user_id: int
    workspace_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
