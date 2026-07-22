from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_all_users():
    """Get all users."""
    return {"message": "Get All Users - Pending Implementation"}


@router.get("/{user_id}")
def get_user(user_id: int):
    """Get user by ID."""
    return { "message": f"Get User {user_id} - Pending Implementation"}


@router.put("/{user_id}")
def update_user(user_id: int):
    """Update user details."""
    return { "message": f"Update User {user_id} - Pending Implementation" }


@router.delete("/{user_id}")
def delete_user(user_id: int):
    """Delete user."""
    return { "message": f"Delete User {user_id} - Pending Implementation"}
