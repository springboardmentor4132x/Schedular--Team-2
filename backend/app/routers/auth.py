<<<<<<< HEAD
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth import register_user, login_user
from app.database.database import get_db
from app.auth.dependencies import get_current_user
=======
from fastapi import APIRouter
>>>>>>> e0a74cab1af7c4efa9a1b64c26be42f2e3ffc04d

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

<<<<<<< HEAD

@router.get("/")
def auth_home():
    return {
        "message": "Authentication API Running"
    }


# ==========================
# Register User
# ==========================
@router.post("/register")
def register(
    user: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(db, user)


# ==========================
# Login User
# ==========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = LoginRequest(
        email=form_data.username,
        password=form_data.password
    )

    return login_user(db, user)


# ==========================
# Profile
# ==========================
@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user": current_user
    }
=======
# ----------------------------------------------------
# @Poojitha: Implement your JWT Auth logic here
# ----------------------------------------------------

@router.post("/register")
def register():
    """Registers a new user in PostgreSQL."""
    return {"message": "Pending Implementation (Poojitha)"}

@router.post("/login")
def login():
    """Authenticates a user and returns a JWT token."""
    return {"message": "Pending Implementation (Poojitha)"}

@router.get("/me")
def get_me():
    """Returns the currently logged-in user details (Protected Route)."""
    return {"message": "Pending Implementation (Poojitha)"}
>>>>>>> e0a74cab1af7c4efa9a1b64c26be42f2e3ffc04d
