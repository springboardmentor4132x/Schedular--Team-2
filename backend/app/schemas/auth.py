from pydantic import BaseModel, EmailStr


# ----------------------------
# User Registration Schema
# ----------------------------
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"


# ----------------------------
# User Login Schema
# ----------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ----------------------------
# JWT Token Response Schema
# ----------------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ----------------------------
# User Response Schema
# ----------------------------
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True