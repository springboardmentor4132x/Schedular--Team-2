<<<<<<< ours
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth import register_user, login_user
from app.database.database import get_db
from app.auth.dependencies import get_current_user
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token
>>>>>>> theirs

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
@router.get("/")
def auth_home():
    return {
        "message": "Authentication API Running"
    }

<<<<<<< ours

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
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and returns a JWT token."""
    
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    
    # Verify password
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT Token using Poojitha's engine
    jwt_payload = {
        "sub": user.email,
        "id": user.id,
        "role": user.role
    }
    access_token = create_access_token(jwt_payload)
    
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordBearer
from app.auth.jwt import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_email = payload.get("sub")
    if user_email is None:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

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
>>>>>>> theirs
