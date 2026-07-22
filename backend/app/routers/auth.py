from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth import register_user, login_user
from app.database.database import get_db
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


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
