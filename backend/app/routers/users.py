from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.rbac import RoleChecker
from app.database.database import get_db
from app.models.campaign import Campaign
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.user import UserAdminResponse, UserAdminUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

admin_only = RoleChecker(["administrator"])

VALID_ROLES = ("creator", "business", "marketing", "administrator")


def _user_admin_data(db: Session, user: User) -> UserAdminResponse:
    data = UserAdminResponse.model_validate(user)
    data.social_accounts_count = (
        db.query(SocialAccount).filter(SocialAccount.user_id == user.id).count()
    )
    data.campaigns_count = (
        db.query(Campaign).filter(Campaign.user_id == user.id).count()
    )
    data.posts_count = db.query(Post).filter(Post.user_id == user.id).count()
    data.workspaces_count = (
        db.query(Workspace).filter(Workspace.owner_id == user.id).count()
    )
    return data


@router.get("/", response_model=List[UserAdminResponse])
def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """List all platform users (optionally filtered by role / search term)."""
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
                User.username.ilike(term),
                User.company.ilike(term),
            )
        )

    users = query.order_by(User.created_at.desc()).all()
    return [_user_admin_data(db, u) for u in users]


@router.get("/{user_id}", response_model=UserAdminResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Get a single user with related resource counts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_admin_data(db, user)


@router.put("/{user_id}", response_model=UserAdminResponse)
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Update a user's details or role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if "role" in data and data["role"] not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles: {', '.join(VALID_ROLES)}",
        )

    for key, value in data.items():
        if value is None:
            continue
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return _user_admin_data(db, user)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """Delete a user and all of their related data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "administrator":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts cannot be deleted",
        )

    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}
