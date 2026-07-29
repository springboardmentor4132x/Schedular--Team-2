from pydantic import BaseModel, model_validator
from datetime import date


class CampaignCreate(BaseModel):
    campaign_name: str
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than Start date")
        return self


class CampaignUpdate(BaseModel):
    campaign_name: str
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than Start date")
        return self