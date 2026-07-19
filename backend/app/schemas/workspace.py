from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserResponse

class WorkspaceMemberBase(BaseModel):
    role: str

class WorkspaceMemberCreate(WorkspaceMemberBase):
    user_id: int

class WorkspaceMemberResponse(WorkspaceMemberBase):
    id: int
    workspace_id: int
    user_id: int
    joined_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

class WorkspaceBase(BaseModel):
    name: str

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceResponse(WorkspaceBase):
    id: int
    owner_id: int
    created_at: datetime
    members: List[WorkspaceMemberResponse] = []

    class Config:
        from_attributes = True
