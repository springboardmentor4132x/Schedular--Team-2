import email

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import  OAuth2PasswordRequestForm
from httpx import request
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.auth.dependencies import get_current_user
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token

from fastapi import Request
from fastapi.responses import RedirectResponse
from app.auth.google_oauth import oauth
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/")
def auth_home():
    return {
        "message": "Authentication API Running"
    }

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user in PostgreSQL."""
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Hash the password
    hashed_pwd = hash_password(user_data.password)
    
    # Create new User model instance
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_pwd,
        role=user_data.role
    )
    
    # Save to PostgreSQL
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

# @router.post("/login")
# def login():
#     return {"message": "login test"}

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({
        "sub": user.email,
        "id": user.id,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently logged-in user details."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(user_update: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Updates the currently logged-in user details."""
    for key, value in user_update.items():
        if hasattr(current_user, key) and key not in ["id", "password_hash", "email"]:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/google/login")
async def google_login(request: Request, role: str = "business"):
    request.session["role"] = role

    return await oauth.google.authorize_redirect(
        request,
        settings.GOOGLE_REDIRECT_URI,
    )

@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    email = user_info["email"]

    user = db.query(User).filter(
        User.email == email
    ).first()

    role = request.session.get("role", "business")

    if user:
        if user.role != role:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"This account already belongs to the "
                    f"{user.role} role."
                ),
            )
    else:
        user = User(
            first_name=user_info.get("given_name", ""),
            last_name=user_info.get("family_name", ""),
            username=email.split("@")[0],
            email=email,
            password_hash="google_oauth",
            role=role,
        )

        print("Adding user to database")
        db.add(user)

        print("Committing changes")
        db.commit()
        db.refresh(user)


    print("Google callback started")
    print(user_info)
    print(role)
    print(user)

    user = db.query(User).filter(
        User.email == email
    ).first()

    routes = {
        "creator": "http://localhost:5173/dashboard/creator",
        "business": "http://localhost:5173/dashboard/business",
        "marketing": "http://localhost:5173/dashboard/marketing",
        "administrator": "http://localhost:5173/dashboard/admin",
    }

    return RedirectResponse(
        url=routes.get(
            role,
            "http://localhost:5173/dashboard/business",
        )
    )