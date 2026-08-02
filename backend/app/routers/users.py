from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_all_users():
    """Get all users."""
    return {
    "status": "success",
    "data": []
}


@router.get("/{user_id}")
def get_user(user_id: int):
    """Get user by ID."""
    return {
        "status": "success",
        "data": {
            "id": user_id,
            "name": f"User {user_id}",
            "email": f"user{user_id}@example.com"
        }
    }


@router.put("/{user_id}")
def update_user(user_id: int):
    """Update user details."""
    return {
        "status": "success",
        "data": {
            "id": user_id,
            "name": f"User {user_id}",
            "email": f"user{user_id}@example.com"
        }
    }


@router.delete("/{user_id}")
def delete_user(user_id: int):
    """Delete user."""
    return {
        "status": "success",
        "data": {
            "id": user_id,
            "name": f"User {user_id}",
            "email": f"user{user_id}@example.com"
        }
    }
