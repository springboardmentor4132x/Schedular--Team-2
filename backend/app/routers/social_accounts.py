from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount
from app.schemas.social_account import (
    SocialAccountConnect,
    SocialAccountResponse,
)
from app.auth.dependencies import get_current_user
from typing import List
from datetime import datetime, timezone
import uuid
import random

from app.services.facebook_service import (
    get_facebook_login_url,
    exchange_code_for_access_token,
)

from app.services.linkedin_service import (
    get_linkedin_login_url,
    exchange_code_for_access_token as exchange_linkedin_token,
)

from app.services.youtube_service import (
    get_youtube_login_url,
    exchange_code_for_access_token as exchange_youtube_token,
)

from app.services.instagram_service import (
    get_instagram_login_url,
    exchange_code_for_access_token as exchange_instagram_token,
)

from app.services.twitter_service import (
    get_twitter_login_url,
    exchange_code_for_access_token as exchange_twitter_token,
)

router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
)


@router.get("/", response_model=List[SocialAccountResponse])
def get_social_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == current_user.id).all()
    return accounts


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
    return RedirectResponse(
        url="http://localhost:5173/social-accounts?success=true"
)
# ===========================
# Facebook OAuth
# ===========================

@router.get("/facebook/connect")
def connect_facebook():
    """
    Redirect user to Facebook Login.
    """
    url = get_facebook_login_url()
    return RedirectResponse(url=url)


@router.get("/facebook/callback")
def facebook_callback(code: str):
    """
    Facebook redirects here after login.
    Exchange authorization code for access token.
    """
    try:
        token_data = exchange_code_for_access_token(code)

        return {
            "message": "Facebook connected successfully",
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "expires_in": token_data["expires_in"]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ===========================
# Linkedin OAuth
# ===========================    

@router.get("/linkedin/connect")
def connect_linkedin():
    url = get_linkedin_login_url()
    return RedirectResponse(url=url)


@router.get("/linkedin/callback")
def linkedin_callback(code: str):
    try:
        token_data = exchange_linkedin_token(code)

        return {
            "message": "LinkedIn connected successfully",
            "access_token": token_data["access_token"],
            "expires_in": token_data.get("expires_in"),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# ===========================
# YouTube OAuth
# ===========================

@router.get("/youtube/connect")
def connect_youtube():
    """
    Redirect user to Google OAuth Login.
    """
    url = get_youtube_login_url()
    return RedirectResponse(url=url)


@router.get("/youtube/callback")
def youtube_callback(code: str):
    """
    Google redirects here after login.
    Exchange authorization code for access token.
    """
    try:
        token_data = exchange_youtube_token(code)

        return {
            "message": "YouTube connected successfully",
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "expires_in": token_data.get("expires_in"),
            "refresh_token": token_data.get("refresh_token"),
            "scope": token_data.get("scope"),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ===========================
# Instagram OAuth
# ===========================

@router.get("/instagram/connect")
def connect_instagram():
    """
    Redirect user to Instagram Business Login.
    """
    url = get_instagram_login_url()
    return RedirectResponse(url=url)


@router.get("/instagram/callback")
def instagram_callback(code: str):
    """
    Instagram redirects here after login.
    Exchange authorization code for access token.
    """
    try:
        token_data = exchange_instagram_token(code)

        return {
            "message": "Instagram connected successfully",
            "access_token": token_data.get("access_token"),
            "user_id": token_data.get("user_id"),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# ===========================
# Twitter OAuth
# ===========================

@router.get("/twitter/connect")
def connect_twitter():
    url = get_twitter_login_url()
    return RedirectResponse(url=url)


@router.get("/twitter/callback")
def twitter_callback(code: str):
    token_data = exchange_twitter_token(code)

    return {
        "message": "X account connected successfully",
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
    }




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
