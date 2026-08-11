from typing import List
from datetime import datetime, timezone
import httpx

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import SessionLocal, get_db
from app.models.social_account import SocialAccount
from app.models.user import User
from app.core.config import settings

from app.schemas.social_account import (
    SocialAccountConnect,
    SocialAccountResponse,
)

from app.schemas.facebook import (
    FacebookInsightsRequest,
    FacebookPostRequest,
    FacebookPhotoRequest,
)

from app.services.facebook_service import (
    get_facebook_login_url,
    exchange_code_for_access_token,
    get_facebook_user_info,
    get_long_lived_access_token as get_fb_long_lived_token,
    get_page_insights,
    get_user_pages,
    create_facebook_post,
    upload_facebook_photo,
)

from app.services.linkedin_service import (
    get_linkedin_login_url,
    exchange_code_for_access_token as exchange_linkedin_token,
    get_linkedin_user_info,
    get_linkedin_profile,
    create_linkedin_post,
)

from app.services.youtube_service import (
    get_youtube_login_url,
    exchange_code_for_access_token as exchange_youtube_token,
    get_youtube_user_info,
    get_channel_details,
    upload_video,
)

from app.services.instagram_service import (
    get_instagram_login_url,
    exchange_code_for_access_token as exchange_instagram_token,
    get_instagram_user_info,
    get_long_lived_access_token as get_ig_long_lived_token,
    get_instagram_business_account,
    create_media_container,
    publish_media,
)

from app.services.twitter_service import (
    get_twitter_login_url,
    exchange_twitter_token,
    get_twitter_user_info,
    publish_tweet,
)

from app.services.pinterest_service import (
    get_pinterest_login_url,
    exchange_code_for_access_token as exchange_pinterest_token,
    get_pinterest_user_info,
)
from app.routers import settings

router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
)


@router.get("/", response_model=List[SocialAccountResponse])
def get_social_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == current_user.id).all()
    return accounts


# ===========================
# Facebook OAuth
# ===========================

# @router.get("/facebook/connect")
# def connect_facebook(request: Request):
#     user_id = request.query_params.get("user_id")

#     if user_id:
#         request.session["user_id"] = user_id

#     url = get_facebook_login_url()

#     return RedirectResponse(url=url)



# @router.get("/facebook/callback")
# def facebook_callback(
#     request: Request,
#     code: str = "",
#     db: Session = Depends(get_db),
#     ):
#     """
#     Facebook redirects here after login.
#     Exchange authorization code for the access token,
#     retrieve user information, and store it in the database.
#     """
#     try:
#         if not code or request.query_params.get("error"):
#             err = request.query_params.get("error") or "Authorization failed"
#             return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
#         # Get the user from session (OAuth state)
#         # In production, use proper state parameter to identify user
#         user_id = request.session.get("user_id")
#         if not user_id:
#             # Try to get from query param or cookie
#             user_id = request.query_params.get("user_id")
        
#         if not user_id:
#             return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserSession")
        
#         user = db.query(User).filter(User.id == int(user_id)).first()
#         if not user:
#             return RedirectResponse(url="http://localhost:5173/social-accounts?error=UserNotFound")

#         # Exchange code for short-lived token
#         token_data = exchange_code_for_access_token(code)
#         short_lived_token = token_data["access_token"]

#         # Exchange for long-lived token (60 days)
#         long_lived_data = get_fb_long_lived_token(short_lived_token)
#         access_token = long_lived_data["access_token"]
        
#         # Calculate expiry
#         expires_in = long_lived_data.get("expires_in", 5184000)  # 60 days default
#         token_expires_at = datetime.now(timezone.utc) + timezone.utc.utcoffset(datetime.now()) if expires_in else None
#         if expires_in:
#             token_expires_at = datetime.now(timezone.utc) + __import__('datetime').timedelta(seconds=expires_in)

#         # Get user info (Facebook Page)
#         user_info = get_facebook_user_info(access_token)

#         # Check if already connected
#         existing = db.query(SocialAccount).filter(
#             SocialAccount.user_id == user.id,
#             SocialAccount.platform == "facebook",
#             SocialAccount.platform_user_id == user_info["platform_user_id"]
#         ).first()
        
#         if existing:
#             # Update existing
#             existing.access_token = access_token
#             existing.token_expires_at = token_expires_at
#             existing.username = user_info["username"]
#             existing.followers_count = user_info["followers_count"]
#             existing.profile_image = user_info["profile_image"]
#             existing.last_sync = datetime.now(timezone.utc)
#             existing.status = "Connected"
#             existing.health = "Healthy"
#             db.commit()
#             db.refresh(existing)
#         else:
#             # Create new
#             new_account = SocialAccount(
#                 user_id=user.id,
#                 platform="facebook",
#                 platform_user_id=user_info["platform_user_id"],
#                 username=user_info["username"],
#                 profile_image=user_info["profile_image"],
#                 followers_count=user_info["followers_count"],
#                 access_token=access_token,
#                 token_expires_at=token_expires_at,
#                 status="Connected",
#                 health="Healthy",
#                 connected_since=datetime.now(timezone.utc),
#                 last_sync=datetime.now(timezone.utc)
#             )
#             db.add(new_account)
#             db.commit()
#             db.refresh(new_account)

#         return RedirectResponse(
#             url="http://localhost:5173/social-accounts?success=true&platform=facebook"
#         )

#     except Exception as e:
#         import traceback

#         print("=" * 80)
#         print("FACEBOOK ERROR")
#         print(traceback.format_exc())
#         print("=" * 80)

#         raise e


# @router.post("/facebook/post")
# def publish_post(data: FacebookPostRequest):
#     try:
#         return create_facebook_post(
#             data.page_id,
#             data.page_access_token,
#             data.message,
#         )

#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=str(e),
#         )


# @router.post("/facebook/photo")
# def upload_photo(photo: FacebookPhotoRequest):
#     return upload_facebook_photo(
#         photo.page_id,
#         photo.page_access_token,
#         photo.image_url,
#         photo.caption,
#     )

# @router.post("/facebook/insights")
# def facebook_insights(data: FacebookInsightsRequest):
#     return get_page_insights(
#         data.page_id,
#         data.page_access_token
#     )
    

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount
from app.auth.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
)

@router.get("/facebook/connect")
def facebook_login(user_id: int = None, redirect_uri: str = None):
    """Initiates Facebook OAuth login flow."""
    FACEBOOK_CLIENT_ID = settings.FACEBOOK_CLIENT_ID
    fb_redirect_uri = redirect_uri or settings.FACEBOOK_REDIRECT_URI or "http://localhost:8000/api/v1/social-accounts/facebook/callback"
    
    scope = "pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish"
    
    meta_auth_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth?"
        f"client_id={FACEBOOK_CLIENT_ID}&"
        f"redirect_uri={fb_redirect_uri}&"
        f"scope={scope}&"
        f"response_type=code"
    )
    return RedirectResponse(url=meta_auth_url)


@router.get("/facebook/callback")
async def facebook_callback(code: str, db: Session = Depends(get_db)):
    """Handles Facebook OAuth callback, filters for 'OrbitSocial Team', and saves Facebook & Instagram accounts to database."""
    FACEBOOK_CLIENT_ID = settings.FACEBOOK_CLIENT_ID
    FACEBOOK_CLIENT_SECRET = settings.FACEBOOK_CLIENT_SECRET
    FACEBOOK_REDIRECT_URI = settings.FACEBOOK_REDIRECT_URI or "http://localhost:8000/api/v1/social-accounts/facebook/callback"

    async with httpx.AsyncClient() as client:
        # 1. Exchange code for user access token
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        params = {
            "client_id": FACEBOOK_CLIENT_ID,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "code": code
        }
        
        response = await client.get(token_url, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get access token from Facebook."
            )
        token_data = response.json()
        user_access_token = token_data.get("access_token")

        # 2. Fetch pages
        pages_url = "https://graph.facebook.com/v18.0/me/accounts"
        pages_params = {
            "access_token": user_access_token,
            "fields": "id,name,access_token,instagram_business_account"
        }
        
        pages_response = await client.get(pages_url, params=pages_params)
        if pages_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Facebook Pages."
            )
        
        pages_data = pages_response.json().get("data", [])

    # 3. Filter specifically for "OrbitSocial Team"
    target_page = next((page for page in pages_data if page.get("name") == "OrbitSocial Team"), None)
    
    if not target_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facebook Page 'OrbitSocial Team' not found among your connected pages."
        )

    page_id = target_page.get("id")
    page_name = target_page.get("name")
    page_access_token = target_page.get("access_token")
    insta_account = target_page.get("instagram_business_account", {})
    insta_id = insta_account.get("id")

    # 4. Get a default user from the database to attach these social accounts to
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found in the database to link social accounts to."
        )

    saved_accounts = []

    # 5. Save or Update Facebook Page in PostgreSQL
    fb_account = db.query(SocialAccount).filter(
        SocialAccount.user_id == user.id,
        SocialAccount.platform == "facebook",
        SocialAccount.platform_user_id == page_id
    ).first()

    if fb_account:
        fb_account.access_token = page_access_token
        fb_account.username = page_name
        fb_account.status = "Connected"
    else:
        fb_account = SocialAccount(
            user_id=user.id,
            platform="facebook",
            platform_user_id=page_id,
            username=page_name,
            access_token=page_access_token,
            status="Connected"
        )
        db.add(fb_account)
    saved_accounts.append("Facebook: OrbitSocial Team")

    # 6. Save or Update Instagram Business Account in PostgreSQL (if linked)
    if insta_id:
        insta_account_db = db.query(SocialAccount).filter(
            SocialAccount.user_id == user.id,
            SocialAccount.platform == "instagram",
            SocialAccount.platform_user_id == insta_id
        ).first()

        if insta_account_db:
            insta_account_db.access_token = page_access_token
            insta_account_db.username = f"{page_name} (IG)"
            insta_account_db.status = "Connected"
        else:
            insta_account_db = SocialAccount(
                user_id=user.id,
                platform="instagram",
                platform_user_id=insta_id,
                username=f"{page_name} (IG)",
                access_token=page_access_token,
                status="Connected"
            )
            db.add(insta_account_db)
        saved_accounts.append(f"Instagram ID: {insta_id}")

    db.commit()

    return {
        "message": "Successfully connected OrbitSocial Team and saved to database!",
        "saved_accounts": saved_accounts
    }


@router.get("/")
def get_connected_accounts(db: Session = Depends(get_db)):
    """Fetch all saved social accounts from the database safely."""
    try:
        accounts = db.query(SocialAccount).all()
        return {
            "total_accounts": len(accounts),
            "accounts": [
                {
                    "id": acc.id,
                    "platform": acc.platform,
                    "platform_user_id": acc.platform_user_id,
                    "username": acc.username,
                    "status": acc.status,
                    "created_at": str(acc.created_at) if acc.created_at else None
                }
                for acc in accounts
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.delete("/{account_id}")
def disconnect_account(account_id: int, db: Session = Depends(get_db)):
    """Disconnects and deletes a social account from the database."""
    account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Social account not found."
        )
    
    db.delete(account)
    db.commit()
    
    return {
        "message": f"Successfully disconnected and removed account ID {account_id} ({account.platform})."
    }

# ===========================
# LinkedIn OAuth
# ===========================    

@router.get("/linkedin/connect")
def connect_linkedin(request: Request):
    # Store user_id in session for callback
    user_id = request.query_params.get("user_id")
    if user_id:
        request.session["user_id"] = user_id
    url = get_linkedin_login_url()
    return RedirectResponse(url=url)


@router.get("/linkedin/callback")
def linkedin_callback(request: Request, code: str = "", db: Session = Depends(get_db)):
    try:
        if not code or request.query_params.get("error"):
            err = request.query_params.get("error") or "Authorization failed"
            return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
        user_id = request.session.get("user_id") or request.query_params.get("user_id")
        if not user_id:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserSession")
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=UserNotFound")

        token_data = exchange_linkedin_token(code)
        access_token = token_data["access_token"]
        expires_in = token_data.get("expires_in")
        
        token_expires_at = None
        if expires_in:
            token_expires_at = datetime.now(timezone.utc) + __import__('datetime').timedelta(seconds=expires_in)

        user_info = get_linkedin_user_info(access_token)

        existing = db.query(SocialAccount).filter(
            SocialAccount.user_id == user.id,
            SocialAccount.platform == "linkedin",
            SocialAccount.platform_user_id == user_info["platform_user_id"]
        ).first()
        
        if existing:
            existing.access_token = access_token
            existing.token_expires_at = token_expires_at
            existing.username = user_info["username"]
            existing.followers_count = user_info["followers_count"]
            existing.profile_image = user_info["profile_image"]
            existing.last_sync = datetime.now(timezone.utc)
            existing.status = "Connected"
            existing.health = "Healthy"
            db.commit()
            db.refresh(existing)
        else:
            new_account = SocialAccount(
                user_id=user.id,
                platform="linkedin",
                platform_user_id=user_info["platform_user_id"],
                username=user_info["username"],
                profile_image=user_info["profile_image"],
                followers_count=user_info["followers_count"],
                access_token=access_token,
                token_expires_at=token_expires_at,
                status="Connected",
                health="Healthy",
                connected_since=datetime.now(timezone.utc),
                last_sync=datetime.now(timezone.utc)
            )
            db.add(new_account)
            db.commit()
            db.refresh(new_account)

        return RedirectResponse(
            url="http://localhost:5173/social-accounts?success=true&platform=linkedin"
        )

    except Exception as e:
        return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={str(e)}")


@router.post("/linkedin/post")
def linkedin_post(
    access_token: str,
    author_id: str,
    message: str,
):
    return create_linkedin_post(
        access_token,
        author_id,
        message,
    )

# ===========================
# YouTube OAuth
# ===========================

@router.get("/youtube/connect")
def connect_youtube(request: Request):
    user_id = request.query_params.get("user_id")
    if user_id:
        request.session["user_id"] = user_id
    url = get_youtube_login_url()
    return RedirectResponse(url=url)


@router.get("/youtube/callback")
def youtube_callback(
    request: Request,
    code: str = "",
    db: Session = Depends(get_db),
    ):
    try:
        if not code or request.query_params.get("error"):
            err = request.query_params.get("error") or "Authorization failed"
            return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
        user_id = request.session.get("user_id") or request.query_params.get("user_id")
        if not user_id:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserSession")
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=UserNotFound")

        token_data = exchange_youtube_token(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in")
        
        token_expires_at = None
        if expires_in:
            token_expires_at = datetime.now(timezone.utc) + __import__('datetime').timedelta(seconds=expires_in)

        user_info = get_youtube_user_info(access_token)

        existing = db.query(SocialAccount).filter(
            SocialAccount.user_id == user.id,
            SocialAccount.platform == "youtube",
            SocialAccount.platform_user_id == user_info["platform_user_id"]
        ).first()
        
        if existing:
            existing.access_token = access_token
            existing.refresh_token = refresh_token
            existing.token_expires_at = token_expires_at
            existing.username = user_info["username"]
            existing.followers_count = user_info["followers_count"]
            existing.profile_image = user_info["profile_image"]
            existing.last_sync = datetime.now(timezone.utc)
            existing.status = "Connected"
            existing.health = "Healthy"
            db.commit()
            db.refresh(existing)
        else:
            new_account = SocialAccount(
                user_id=user.id,
                platform="youtube",
                platform_user_id=user_info["platform_user_id"],
                username=user_info["username"],
                profile_image=user_info["profile_image"],
                followers_count=user_info["followers_count"],
                access_token=access_token,
                refresh_token=refresh_token,
                token_expires_at=token_expires_at,
                status="Connected",
                health="Healthy",
                connected_since=datetime.now(timezone.utc),
                last_sync=datetime.now(timezone.utc)
            )
            db.add(new_account)
            db.commit()
            db.refresh(new_account)

        return RedirectResponse(
            url="http://localhost:5173/social-accounts?success=true&platform=youtube"
        )

    except Exception as e:
        return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={str(e)}")


@router.post("/youtube/upload")
def youtube_upload(
    access_token: str,
    video_path: str,
    title: str,
    description: str,
):
    return upload_video(
        access_token,
        video_path,
        title,
        description,
    )
    
# ===========================
# Instagram OAuth
# ===========================

@router.get("/instagram/connect")
def connect_instagram(request: Request):
    user_id = request.query_params.get("user_id")
    if user_id:
        request.session["user_id"] = user_id
    url = get_instagram_login_url()
    return RedirectResponse(url=url)


@router.get("/instagram/callback")
def instagram_callback(request: Request, code: str = "", db: Session = Depends(get_db)):
    try:
        if not code or request.query_params.get("error"):
            err = request.query_params.get("error") or "Authorization failed"
            return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
        user_id = request.session.get("user_id") or request.query_params.get("user_id")
        if not user_id:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserSession")
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=UserNotFound")

        # Exchange code for short-lived token
        print("========== STEP 1 ==========")
        token_data = exchange_instagram_token(code)
        print(token_data)

        short_lived_token = token_data.get("access_token")
        
        # Exchange for long-lived token (60 days)
        print("========== STEP 2 ==========")
        long_lived_data = get_ig_long_lived_token(short_lived_token)
        print(long_lived_data)

        access_token = long_lived_data["access_token"]
        expires_in = long_lived_data.get("expires_in", 5184000)
        
        token_expires_at = datetime.now(timezone.utc) + __import__('datetime').timedelta(seconds=expires_in)

        print("========== STEP 3 ==========")
        user_info = get_instagram_user_info(access_token)
        print(user_info)
        
        existing = db.query(SocialAccount).filter(
            SocialAccount.user_id == user.id,
            SocialAccount.platform == "instagram",
            SocialAccount.platform_user_id == user_info["platform_user_id"]
        ).first()
        
        if existing:
            existing.access_token = access_token
            existing.token_expires_at = token_expires_at
            existing.username = user_info["username"]
            existing.followers_count = user_info["followers_count"]
            existing.profile_image = user_info["profile_image"]
            existing.last_sync = datetime.now(timezone.utc)
            existing.status = "Connected"
            existing.health = "Healthy"
            db.commit()
            db.refresh(existing)
        else:
            new_account = SocialAccount(
                user_id=user.id,
                platform="instagram",
                platform_user_id=user_info["platform_user_id"],
                username=user_info["username"],
                profile_image=user_info["profile_image"],
                followers_count=user_info["followers_count"],
                access_token=access_token,
                token_expires_at=token_expires_at,
                status="Connected",
                health="Healthy",
                connected_since=datetime.now(timezone.utc),
                last_sync=datetime.now(timezone.utc)
            )
            db.add(new_account)
            db.commit()
            db.refresh(new_account)

        return RedirectResponse(
            url="http://localhost:5173/social-accounts?success=true&platform=instagram"
        )

    except Exception as e:
        return RedirectResponse(
            url=f"http://localhost:5173/social-accounts?error={str(e)}"
        )
    


@router.post("/instagram/post")
def instagram_post(
    instagram_account_id: str,
    image_url: str,
    caption: str,
    access_token: str,
):
    media = create_media_container(
        instagram_account_id,
        image_url,
        caption,
        access_token,
    )

    creation_id = media["id"]

    return publish_media(
        instagram_account_id,
        creation_id,
        access_token,
    )


@router.get("/instagram/account")
def get_instagram_account(
    page_id: str,
    access_token: str,
):
    return get_instagram_business_account(
        page_id,
        access_token,
    )

# ===========================
# Twitter OAuth
# ===========================

@router.get("/twitter/connect")
def connect_twitter(request: Request):
    user_id = request.query_params.get("user_id")

    if not user_id:
        return {
            "error": "Please provide a user_id."
        }

    request.session["user_id"] = user_id

    url = get_twitter_login_url(user_id)

    return RedirectResponse(url=url)



@router.get("/twitter/callback")
def twitter_callback(
    request: Request,
    code: str = "",
    db: Session = Depends(get_db),
):
    try:
        if not code or request.query_params.get("error"):
            err = request.query_params.get("error") or "Authorization failed"
            return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
        user_id = (
            request.session.get("user_id")
            or request.query_params.get("state")
        )

        if not user_id:
            return {
                "error": "No user session found."
            }

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if not user:
            return {
                "error": "User not found."
            }

        token_data = exchange_twitter_token(code)

        print("=" * 50)
        print("TOKEN DATA")
        print(token_data)
        print("=" * 50)

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")

        print("=" * 50)
        print("ACCESS TOKEN")
        print(access_token)
        print("=" * 50)

        print("TOKEN LENGTH")
        print(len(access_token))

        print("=" * 50)
        print("REFRESH TOKEN")
        print(refresh_token)
        print("=" * 50)

        user_info = get_twitter_user_info(access_token)

        print("=" * 50)
        print("USER INFO")
        print(user_info)
        print("=" * 50)

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")

        user_info = get_twitter_user_info(access_token)

        existing = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user.id,
                SocialAccount.platform == "twitter",
                SocialAccount.platform_user_id == user_info["platform_user_id"],
            )
            .first()
        )

        if existing:
            existing.access_token = access_token
            existing.refresh_token = refresh_token
            existing.username = user_info["username"]
            existing.followers_count = user_info["followers_count"]
            existing.profile_image = user_info["profile_image"]
            existing.last_sync = datetime.now(timezone.utc)
            existing.status = "Connected"
            existing.health = "Healthy"

        else:
            new_account = SocialAccount(
                user_id=user.id,
                platform="twitter",
                platform_user_id=user_info["platform_user_id"],
                username=user_info["username"],
                profile_image=user_info["profile_image"],
                followers_count=user_info["followers_count"],
                access_token=access_token,
                refresh_token=refresh_token,
                status="Connected",
                health="Healthy",
                connected_since=datetime.now(timezone.utc),
                last_sync=datetime.now(timezone.utc),
            )

            db.add(new_account)

        db.commit()

        return RedirectResponse(
            url="http://localhost:5173/social-accounts?success=true&platform=x"
        )

    except Exception as e:
        import traceback
        print("=" * 80)
        print("TWITTER ERROR")
        print(traceback.format_exc())
        print("=" * 80)
        
        return {
            "error": str(e)
        }

    
@router.post("/twitter/post")
def twitter_post(
    access_token: str,
    message: str
):
    return publish_tweet(
        access_token,
        message,
    )

# ===========================
# Pinterest OAuth
# ===========================

@router.get("/pinterest/connect")
def connect_pinterest(request: Request):
    user_id = request.query_params.get("user_id")
    if user_id:
        request.session["user_id"] = user_id
    url = get_pinterest_login_url()
    return RedirectResponse(url=url)


@router.get("/pinterest/callback")
def pinterest_callback(request: Request, code: str = "", db: Session = Depends(get_db)):
    try:
        if not code or request.query_params.get("error"):
            err = request.query_params.get("error") or "Authorization failed"
            return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={err}")
        user_id = request.session.get("user_id") or request.query_params.get("user_id")
        if not user_id:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=NoUserSession")

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return RedirectResponse(url="http://localhost:5173/social-accounts?error=UserNotFound")

        token_data = exchange_pinterest_token(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in")

        token_expires_at = None
        if expires_in:
            token_expires_at = datetime.now(timezone.utc) + __import__('datetime').timedelta(seconds=expires_in)

        user_info = get_pinterest_user_info(access_token)

        existing = db.query(SocialAccount).filter(
            SocialAccount.user_id == user.id,
            SocialAccount.platform == "pinterest",
            SocialAccount.platform_user_id == user_info["platform_user_id"]
        ).first()

        if existing:
            existing.access_token = access_token
            existing.refresh_token = refresh_token
            existing.token_expires_at = token_expires_at
            existing.username = user_info["username"]
            existing.followers_count = user_info["followers_count"]
            existing.profile_image = user_info["profile_image"]
            existing.last_sync = datetime.now(timezone.utc)
            existing.status = "Connected"
            existing.health = "Healthy"
            db.commit()
            db.refresh(existing)
        else:
            new_account = SocialAccount(
                user_id=user.id,
                platform="pinterest",
                platform_user_id=user_info["platform_user_id"],
                username=user_info["username"],
                profile_image=user_info["profile_image"],
                followers_count=user_info["followers_count"],
                access_token=access_token,
                refresh_token=refresh_token,
                token_expires_at=token_expires_at,
                status="Connected",
                health="Healthy",
                connected_since=datetime.now(timezone.utc),
                last_sync=datetime.now(timezone.utc)
            )
            db.add(new_account)
            db.commit()
            db.refresh(new_account)

        return RedirectResponse(
            url="http://localhost:5173/social-accounts?success=true&platform=pinterest"
        )

    except Exception as e:
        return RedirectResponse(url=f"http://localhost:5173/social-accounts?error={str(e)}")


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
    
    # Fetch fresh data from platform API
    try:
        if account.platform == "facebook":
            user_info = get_facebook_user_info(account.access_token)
        elif account.platform == "instagram":
            user_info = get_instagram_user_info(account.access_token)
        elif account.platform == "youtube":
            user_info = get_youtube_user_info(account.access_token)
        elif account.platform == "linkedin":
            user_info = get_linkedin_user_info(account.access_token)
        elif account.platform == "twitter":
            user_info = get_twitter_user_info(account.access_token)
        elif account.platform == "pinterest":
            user_info = get_pinterest_user_info(account.access_token)
        else:
            raise Exception(f"Unknown platform: {account.platform}")
        
        account.followers_count = user_info.get("followers_count", account.followers_count)
        account.username = user_info.get("username", account.username)
        account.profile_image = user_info.get("profile_image", account.profile_image)
        account.last_sync = datetime.now(timezone.utc)
        account.status = "Connected"
        account.health = "Healthy"
        
    except Exception as e:
        account.health = "Error"
        account.status = "Error"
        # Don't raise, just log and return current data
    
    db.commit()
    db.refresh(account)
    return account