from pydantic import BaseModel, EmailStr
from typing import Optional

# Base Schema (Shared attributes)
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Registration Schema (Expects password and full details)
class UserCreate(UserBase):
    first_name: str
    last_name: str
    phone: str
    password: str
    role: Optional[str] = "creator"

# Profile Update Schema
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    bio: Optional[str] = None

# Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response Schema (What the API returns to React)
class UserResponse(UserBase):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    role: str

    class Config:
        from_attributes = True

# JWT Token Response Schema
class Token(BaseModel):
    access_token: str
    token_type: str
