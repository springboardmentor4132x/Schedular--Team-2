from sqlalchemy.orm import Session

from app.models.user import User
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token


# ==========================
# Register User
# ==========================
def register_user(db: Session, user):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {
            "detail": "Email already registered"
        }

    # Hash Password
    hashed_password = hash_password(user.password)

    # Create User
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )

    # Save to Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role
    }


# ==========================
# Login User
# ==========================
def login_user(db: Session, user):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        return {
            "detail": "Invalid email or password"
        }

    if not verify_password(user.password, db_user.password_hash):
        return {
            "detail": "Invalid email or password"
        }

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }