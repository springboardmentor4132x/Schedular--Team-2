from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

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

from fastapi.responses import RedirectResponse
router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
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


# ===========================
# Other Social Account APIs
# ===========================

@router.post("/connect")
def connect_social_account():
    return {
        "message": "Connect Social Account - Pending Implementation"
    }


@router.get("/")
def get_connected_accounts():
    return {
        "message": "Get Connected Social Accounts - Pending Implementation"
    }


@router.get("/{account_id}")
def get_connected_account(account_id: int):
    return {
        "message": f"Get Social Account {account_id} - Pending Implementation"
    }


@router.put("/{account_id}")
def update_connected_account(account_id: int):
    return {
        "message": f"Update Social Account {account_id} - Pending Implementation"
    }


@router.delete("/{account_id}")
def disconnect_social_account(account_id: int):
    return {
        "message": f"Disconnect Social Account {account_id} - Pending Implementation"
    }