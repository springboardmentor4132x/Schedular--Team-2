from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

# Secret Key (Move this to .env later)
SECRET_KEY = "a3f9d5c8e7b2f1a6d4c9e8b7f5a2c1d6e9f3b8a7c5d2e1f4"

# JWT Algorithm
ALGORITHM = "HS256"

# Token Expiry Time (30 Minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Create JWT Access Token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# Verify JWT Token
def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None