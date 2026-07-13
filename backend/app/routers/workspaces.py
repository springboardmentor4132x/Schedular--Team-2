from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceMemberCreate, WorkspaceMemberResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"]
)

@router.get("/", response_model=List[WorkspaceResponse])
def get_workspaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Workspaces where user is owner or member
    workspaces = db.query(Workspace).outerjoin(WorkspaceMember).filter(
        (Workspace.owner_id == current_user.id) | (WorkspaceMember.user_id == current_user.id)
    ).all()
    # Need to uniquely fetch in case of duplicates from outerjoin
    workspaces_set = list({w.id: w for w in workspaces}.values())
    return workspaces_set

@router.post("/", response_model=WorkspaceResponse)
def create_workspace(workspace_in: WorkspaceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workspace = Workspace(name=workspace_in.name, owner_id=current_user.id)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    # Add owner as an admin member too
    member = WorkspaceMember(workspace_id=workspace.id, user_id=current_user.id, role="Admin")
    db.add(member)
    db.commit()
    db.refresh(workspace)
    
    return workspace

@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse)
def add_workspace_member(workspace_id: int, member_in: WorkspaceMemberCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    # Only owner can add members
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add members to this workspace")
        
    member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == member_in.user_id).first()
    if member:
        raise HTTPException(status_code=400, detail="User is already a member of this workspace")
        
    # Ensure user exists
    user_to_add = db.query(User).filter(User.id == member_in.user_id).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User to add not found")

    new_member = WorkspaceMember(workspace_id=workspace_id, user_id=member_in.user_id, role=member_in.role)
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member
