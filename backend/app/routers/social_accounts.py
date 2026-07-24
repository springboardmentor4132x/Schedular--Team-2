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
import os
import urllib.parse
import requests
import base64

router = APIRouter(
    prefix="/social",
    tags=["Social Accounts"]
)

# Load env variables for Phase 1
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/api/v1/social/callback/linkedin")

TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID", "")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET", "")
TWITTER_REDIRECT_URI = os.getenv("TWITTER_REDIRECT_URI", "http://localhost:8000/api/v1/social/callback/twitter")

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID", "")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET", "")
FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/api/v1/social/callback/facebook")

PINTEREST_CLIENT_ID = os.getenv("PINTEREST_CLIENT_ID", "")
PINTEREST_CLIENT_SECRET = os.getenv("PINTEREST_CLIENT_SECRET", "")
PINTEREST_REDIRECT_URI = os.getenv("PINTEREST_REDIRECT_URI", "http://localhost:8000/api/v1/social/callback/pinterest")

YOUTUBE_CLIENT_ID = os.getenv("YOUTUBE_CLIENT_ID", "")
YOUTUBE_CLIENT_SECRET = os.getenv("YOUTUBE_CLIENT_SECRET", "")
YOUTUBE_REDIRECT_URI = os.getenv("YOUTUBE_REDIRECT_URI", "http://localhost:8000/api/v1/social/callback/youtube")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/", response_model=List[SocialAccountResponse])
def get_social_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == current_user.id).all()
    return accounts


@router.get("/connect/{platform}")
def connect_social_account_redirect(platform: str, current_user: User = Depends(get_current_user)):
    """
    Step 1: Backend generates the OAuth URL and returns it to the frontend to redirect the user.
    We pass the JWT-based user ID in the OAuth 'state' parameter to identify the user upon callback.
    """
    platform = platform.lower()
    state = str(current_user.id) # In production, hash or encrypt this state to prevent CSRF/tampering
    
    if platform == "linkedin":
        if not LINKEDIN_CLIENT_ID:
            raise HTTPException(status_code=500, detail="LinkedIn credentials not configured")
        
        # Scope requested per PDF: openid, profile, email, w_member_social
        scopes = "openid profile email w_member_social"
        params = {
            "response_type": "code",
            "client_id": LINKEDIN_CLIENT_ID,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "state": state,
            "scope": scopes
        }
        url = f"https://www.linkedin.com/oauth/v2/authorization?{urllib.parse.urlencode(params)}"
        return {"auth_url": url}
        
    elif platform in ["facebook", "instagram"]:
        if not FACEBOOK_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Facebook credentials not configured")
            
        # Scope requested per Meta PDFs
        scopes = "pages_show_list,pages_manage_posts,pages_read_engagement,business_management,instagram_basic,instagram_content_publish"
        params = {
            "client_id": FACEBOOK_CLIENT_ID,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "state": f"{state}:{platform}", # embed requested platform to know what to highlight, though it fetches both
            "scope": scopes,
            "response_type": "code"
        }
        url = f"https://www.facebook.com/v18.0/dialog/oauth?{urllib.parse.urlencode(params)}"
        return {"auth_url": url}
        
    elif platform == "twitter" or platform == "x":
        if not TWITTER_CLIENT_ID:
            raise HTTPException(status_code=500, detail="X (Twitter) credentials not configured")
            
        # Scope requested per PDF: tweet.read, tweet.write, users.read, offline.access, media.write
        scopes = "tweet.read tweet.write users.read offline.access media.write"
        params = {
            "response_type": "code",
            "client_id": TWITTER_CLIENT_ID,
            "redirect_uri": TWITTER_REDIRECT_URI,
            "state": state,
            "scope": scopes,
            "code_challenge": "challenge", # Simplified for now
            "code_challenge_method": "plain"
        }
        url = f"https://twitter.com/i/oauth2/authorize?{urllib.parse.urlencode(params)}"
        return {"auth_url": url}
        
    elif platform == "pinterest":
        if not PINTEREST_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Pinterest credentials not configured")
            
        scopes = "boards:read,pins:read,pins:write"
        params = {
            "response_type": "code",
            "redirect_uri": PINTEREST_REDIRECT_URI,
            "client_id": PINTEREST_CLIENT_ID,
            "scope": scopes,
            "state": state
        }
        url = f"https://www.pinterest.com/oauth/?{urllib.parse.urlencode(params)}"
        return {"auth_url": url}
        
    elif platform == "youtube":
        if not YOUTUBE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="YouTube credentials not configured")
            
        scopes = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload"
        params = {
            "client_id": YOUTUBE_CLIENT_ID,
            "redirect_uri": YOUTUBE_REDIRECT_URI,
            "response_type": "code",
            "scope": scopes,
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return {"auth_url": url}
        
    else:
        # Fallback for unconnected platforms to avoid breaking UI during phase 1
        return {"auth_url": f"{FRONTEND_URL}/dashboard/connected-accounts?error=UnsupportedPlatform"}


@router.get("/callback/{platform}")
def oauth_callback(platform: str, request: Request, db: Session = Depends(get_db)):
    """
    Step 2: Platform redirects back to backend with 'code'. 
    Backend exchanges code for token, stores in DB, and redirects to React.
    """
    code = request.query_params.get("code")
    error = request.query_params.get("error")
    state = request.query_params.get("state") # user.id
    
    if error or not code or not state:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error={error or 'AuthFailed'}")

    try:
        user_id = int(state.split(':')[0]) if ':' in state else int(state)
    except ValueError:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=InvalidState")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=UserNotFound")

    platform = platform.lower()
    
    # Check if already connected
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == user.id,
        SocialAccount.platform == platform
    ).first()
    
    if existing:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=AlreadyConnected")

    now = datetime.now(timezone.utc)
    
    if platform == "linkedin":
        # 1. Exchange Code for Token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET
        }
        
        try:
            token_res = requests.post("https://www.linkedin.com/oauth/v2/accessToken", data=token_data, timeout=10)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=TokenExchangeFailed")
                
            access_token = token_res.json().get("access_token")
            
            # 2. Fetch Profile via /v2/userinfo
            headers = {"Authorization": f"Bearer {access_token}"}
            profile_res = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers, timeout=10)
            
            if profile_res.status_code == 200:
                profile = profile_res.json()
                display_name = profile.get("name", f"{user.username}_linkedin")
            else:
                display_name = f"{user.username}_linkedin"
                
        except requests.RequestException:
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=NetworkError")

        new_account = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            username=display_name,
            followers_count="0",
            access_token=access_token,
            refresh_token=token_res.json().get("refresh_token", ""),
            status="Connected",
            health="Healthy",
            connected_since=now,
            last_sync=now
        )
        db.add(new_account)
        db.commit()

    elif platform == "twitter" or platform == "x":
        platform = "x" # Normalize name
        
        # 1. Exchange Code for Token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": TWITTER_REDIRECT_URI,
            "client_id": TWITTER_CLIENT_ID,
            "code_verifier": "challenge"
        }
        auth = (TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET)
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        
        try:
            token_res = requests.post("https://api.twitter.com/2/oauth2/token", data=token_data, auth=auth, headers=headers, timeout=10)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=TokenExchangeFailed")
                
            access_token = token_res.json().get("access_token")
            
            # 2. Fetch Profile via /2/users/me
            profile_headers = {"Authorization": f"Bearer {access_token}"}
            profile_res = requests.get("https://api.twitter.com/2/users/me", headers=profile_headers, timeout=10)
            
            if profile_res.status_code == 200:
                profile = profile_res.json().get("data", {})
                display_name = profile.get("username", f"{user.username}_x")
                followers = "0"
            else:
                display_name = f"{user.username}_x"
                followers = "0"
                
        except requests.RequestException:
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=NetworkError")

        new_account = SocialAccount(
            user_id=user.id,
            platform="x",
            username=f"@{display_name}",
            followers_count=followers,
            access_token=access_token,
            refresh_token=token_res.json().get("refresh_token", ""),
            status="Connected",
            health="Healthy",
            connected_since=now,
            last_sync=now
        )
        db.add(new_account)
        db.commit()
        
    elif platform in ["facebook", "instagram"]:
        # 1. Exchange Code for Token
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        params = {
            "client_id": FACEBOOK_CLIENT_ID,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "code": code
        }
        
        try:
            token_res = requests.get(token_url, params=params, timeout=10)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=TokenExchangeFailed")
                
            access_token = token_res.json().get("access_token")
            
            # 2. Fetch User Pages
            pages_res = requests.get("https://graph.facebook.com/v18.0/me/accounts", params={"access_token": access_token}, timeout=10)
            
            if pages_res.status_code == 200:
                pages_data = pages_res.json().get("data", [])
                
                for page in pages_data:
                    page_id = page.get("id")
                    page_token = page.get("access_token")
                    page_name = page.get("name")
                    
                    # Store Facebook Page Connection
                    existing_fb = db.query(SocialAccount).filter(
                        SocialAccount.user_id == user.id,
                        SocialAccount.platform == "facebook",
                        SocialAccount.username == page_name
                    ).first()
                    
                    if not existing_fb:
                        db.add(SocialAccount(
                            user_id=user.id,
                            platform="facebook",
                            username=page_name,
                            followers_count="0", # Optional: can fetch fans_count
                            access_token=page_token,
                            refresh_token="",
                            status="Connected",
                            health="Healthy",
                            connected_since=now,
                            last_sync=now
                        ))
                    
                    # 3. Check for linked Instagram Business Account
                    ig_res = requests.get(f"https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account&access_token={access_token}", timeout=10)
                    if ig_res.status_code == 200:
                        ig_data = ig_res.json()
                        ig_account_id = ig_data.get("instagram_business_account", {}).get("id")
                        
                        if ig_account_id:
                            # 4. Fetch Instagram Account Details
                            ig_info_res = requests.get(f"https://graph.facebook.com/v18.0/{ig_account_id}?fields=username,followers_count&access_token={access_token}", timeout=10)
                            if ig_info_res.status_code == 200:
                                ig_info = ig_info_res.json()
                                ig_username = ig_info.get("username", f"ig_{ig_account_id}")
                                ig_followers = str(ig_info.get("followers_count", 0))
                                
                                existing_ig = db.query(SocialAccount).filter(
                                    SocialAccount.user_id == user.id,
                                    SocialAccount.platform == "instagram",
                                    SocialAccount.username == ig_username
                                ).first()
                                
                                if not existing_ig:
                                    db.add(SocialAccount(
                                        user_id=user.id,
                                        platform="instagram",
                                        username=f"@{ig_username}",
                                        followers_count=ig_followers,
                                        access_token=page_token, # IG Graph API uses the linked Page Access Token
                                        refresh_token="",
                                        status="Connected",
                                        health="Healthy",
                                        connected_since=now,
                                        last_sync=now
                                    ))
                db.commit()
                
        except requests.RequestException:
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=NetworkError")

    elif platform == "pinterest":
        # 1. Exchange Code for Token
        token_url = "https://api.pinterest.com/v5/oauth/token"
        
        # Pinterest requires Basic Auth
        auth_str = f"{PINTEREST_CLIENT_ID}:{PINTEREST_CLIENT_SECRET}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {b64_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": PINTEREST_REDIRECT_URI
        }
        
        try:
            token_res = requests.post(token_url, data=data, headers=headers, timeout=10)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=TokenExchangeFailed")
                
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token", "")
            
            # 2. Fetch Profile via /v5/user_account
            profile_headers = {"Authorization": f"Bearer {access_token}"}
            profile_res = requests.get("https://api.pinterest.com/v5/user_account", headers=profile_headers, timeout=10)
            
            if profile_res.status_code == 200:
                profile = profile_res.json()
                display_name = profile.get("username", f"{user.username}_pinterest")
            else:
                display_name = f"{user.username}_pinterest"
                
        except requests.RequestException:
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=NetworkError")

        new_account = SocialAccount(
            user_id=user.id,
            platform="pinterest",
            username=f"@{display_name}",
            followers_count="0",
            access_token=access_token,
            refresh_token=refresh_token,
            status="Connected",
            health="Healthy",
            connected_since=now,
            last_sync=now
        )
        db.add(new_account)
        db.commit()

    elif platform == "youtube":
        # 1. Exchange Code for Token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": YOUTUBE_CLIENT_ID,
            "client_secret": YOUTUBE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": YOUTUBE_REDIRECT_URI
        }
        
        try:
            token_res = requests.post(token_url, data=data, timeout=10)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=TokenExchangeFailed")
                
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token", "")
            
            # 2. Fetch Channel Profile
            profile_url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true"
            profile_headers = {"Authorization": f"Bearer {access_token}"}
            profile_res = requests.get(profile_url, headers=profile_headers, timeout=10)
            
            if profile_res.status_code == 200:
                profile_items = profile_res.json().get("items", [])
                if profile_items:
                    channel = profile_items[0]
                    display_name = channel.get("snippet", {}).get("title", f"{user.username}_youtube")
                    subs = channel.get("statistics", {}).get("subscriberCount", "0")
                else:
                    display_name = f"{user.username}_youtube"
                    subs = "0"
            else:
                display_name = f"{user.username}_youtube"
                subs = "0"
                
        except requests.RequestException:
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=NetworkError")

        new_account = SocialAccount(
            user_id=user.id,
            platform="youtube",
            username=display_name,
            followers_count=subs,
            access_token=access_token,
            refresh_token=refresh_token,
            status="Connected",
            health="Healthy",
            connected_since=now,
            last_sync=now
        )
        db.add(new_account)
        db.commit()

    else:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?error=UnsupportedPlatform")
    
    # Step 3: Redirect back to React frontend
    return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/connected-accounts?success=true")


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

