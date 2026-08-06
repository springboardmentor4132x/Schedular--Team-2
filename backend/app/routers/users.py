from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.auth.rbac import RoleChecker
from app.models.user import User

creator_only = RoleChecker(["creator"])
admin_only = RoleChecker(["admin"])

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_all_users(
    current_user: User = Depends(admin_only)
):
    """Get all users."""
    return {"message": "Get All Users - Pending Implementation"}


@router.get("/{user_id}")
def get_user(
    user_id: int,
    current_user: User = Depends(admin_only)
):
    """Get user by ID."""
    return { "message": f"Get User {user_id} - Pending Implementation"}


@router.put("/{user_id}")
def update_user(
    user_id: int,
    current_user: User = Depends(admin_only)
):
    """Update user details."""
    return { "message": f"Update User {user_id} - Pending Implementation" }


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(admin_only)
):
    """Delete user."""
    return { "message": f"Delete User {user_id} - Pending Implementation"}
