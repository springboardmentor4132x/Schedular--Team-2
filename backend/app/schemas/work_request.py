from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field

class WorkRequestCreate(BaseModel):
    details: dict[str, Any] = Field(default_factory=dict)

class WorkRequestDecision(BaseModel):
    status: str
    decision_note: str | None = Field(default=None, max_length=1000)

class WorkRequestResponse(BaseModel):
    id: int
    workspace_id: int
    business_user_id: int
    status: str
    details: dict[str, Any]
    decision_note: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
