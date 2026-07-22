from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register():
    """Registers a new user in PostgreSQL."""
    return {"message": "Registration API - Pending Implementation"}

@router.post("/login")
def login():
    """Authenticates a user and returns a JWT token."""
    return {"message": "Login API - Pending Implementation"}

@router.get("/me")
def get_me():
    """Returns the currently logged-in user details ."""
    return {"message": "Profile API - Pending Implementation "}
