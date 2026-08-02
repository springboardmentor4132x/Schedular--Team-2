from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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

# Admin update schema (partial update of any user)
class UserAdminUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    bio: Optional[str] = None

# Admin response schema (includes related resource counts)
class UserAdminResponse(UserBase):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    role: str
    company: Optional[str]
    location: Optional[str]
    website: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: Optional[datetime]
    social_accounts_count: int = 0
    campaigns_count: int = 0
    posts_count: int = 0
    workspaces_count: int = 0

    class Config:
        from_attributes = True

# Response Schema (What the API returns to React)
class UserResponse(UserBase):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# JWT Token Response Schema
class Token(BaseModel):
    access_token: str
    token_type: str
