from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount
from app.schemas.social_account import SocialAccountConnect, SocialAccountResponse
from app.routers.auth import get_current_user
from typing import List
from datetime import datetime, timezone
import uuid
import random
import os

router = APIRouter(
    prefix="/social",
    tags=["Social Accounts"]
)

# Dummy OAuth endpoints mapping based on your PDF docs
OAUTH_ENDPOINTS = {
    "facebook": "https://www.facebook.com/login",
    "instagram": "https://www.instagram.com/accounts/login/",
    "linkedin": "https://www.linkedin.com/login",
    "twitter": "https://twitter.com/login",
    "youtube": "https://accounts.google.com/signin",
    "pinterest": "https://www.pinterest.com/login/"
}

@router.get("/", response_model=List[SocialAccountResponse])
def get_social_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == current_user.id).all()
    return accounts

@router.get("/connect/{platform}")
def connect_social_account_redirect(platform: str):
    """
    Step 1: Backend generates the OAuth URL and redirects the user to the platform's login page.
    """
    platform = platform.lower()
    auth_url = OAUTH_ENDPOINTS.get(platform)
    
    if not auth_url:
        raise HTTPException(status_code=400, detail="Unsupported platform")
        
    return RedirectResponse(url=auth_url)

@router.post("/connect", response_model=SocialAccountResponse)
def mock_connect_social_account(payload: SocialAccountConnect, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Mock endpoint to simulate a connection without requiring actual OAuth callback.
    """
    platform = payload.platform.lower()
    
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.platform == platform
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Account already connected")
        
    followers_count = f"{random.randint(1, 100)}.{random.randint(1, 9)}K"
    if platform == "instagram":
        followers_count = f"{random.randint(10, 500)}K"
    elif platform == "youtube":
        followers_count = f"{random.randint(100, 999)}K subscribers"
        
    now = datetime.now(timezone.utc)
    
    new_account = SocialAccount(
        user_id=current_user.id,
        platform=platform,
        username=f"@{current_user.username}_{platform}",
        followers_count=followers_count,
        access_token=f"mock_access_{uuid.uuid4()}",
        refresh_token=f"mock_refresh_{uuid.uuid4()}",
        status="Connected",
        health="Healthy",
        connected_since=now,
        last_sync=now
    )
    
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account


@router.get("/callback/{platform}")
def oauth_callback(platform: str, request: Request, db: Session = Depends(get_db)):
    """
    Step 2: Platform redirects back to backend with 'code'. 
    Backend exchanges code for token, stores in DB, and redirects to React.
    """
    code = request.query_params.get("code")
    error = request.query_params.get("error")
    
    # In a real scenario, if the user cancels, we redirect with error
    if error:
        return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={error}")

    # MOCK: Because we don't know the specific user in a pure GET callback without a session/JWT cookie,
    # and because this is a mock implementation, we will assign this connection to the first user in the DB.
    # In production, the JWT token would be passed via an HttpOnly cookie or the state parameter.
    user = db.query(User).first()
    if not user:
        return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserFound")

    # Check if already connected
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == user.id,
        SocialAccount.platform == platform
    ).first()
    
    if existing:
        return RedirectResponse(url="http://localhost:5173/social-accounts?error=AlreadyConnected")

    # Simulate OAuth API Token Exchange and Account Fetching
    followers_count = f"{random.randint(1, 100)}.{random.randint(1, 9)}K"
    if platform == "instagram":
        followers_count = f"{random.randint(10, 500)}K"
    elif platform == "youtube":
        followers_count = f"{random.randint(100, 999)}K subscribers"
        
    now = datetime.now(timezone.utc)
    
    new_account = SocialAccount(
        user_id=user.id,
        platform=platform,
        username=f"@{user.username}_{platform}",
        followers_count=followers_count,
        access_token=f"real_access_{uuid.uuid4()}", # Mocked 'real' token
        refresh_token=f"real_refresh_{uuid.uuid4()}",
        status="Connected",
        health="Healthy",
        connected_since=now,
        last_sync=now
    )
    
    db.add(new_account)
    db.commit()
    
    # Step 3: Redirect back to React frontend
    return RedirectResponse(url="http://localhost:5173/social-accounts?success=true")


@router.delete("/{account_id}")
def disconnect_social_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
        
    if account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to disconnect this account")
        
    db.delete(account)
    db.commit()
    
    return {"message": "Account disconnected successfully"}

@router.post("/{account_id}/sync", response_model=SocialAccountResponse)
def sync_social_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
        
    if account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to sync this account")
        
    # Simulate syncing logic
    account.last_sync = datetime.now(timezone.utc)
    account.status = "Connected"
    account.health = "Healthy"
    
    db.commit()
    db.refresh(account)
    return account

