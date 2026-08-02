from app.models.social_account import SocialAccount
from app.database.database import SessionLocal
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from app.schemas.facebook import FacebookInsightsRequest, FacebookPostRequest,FacebookPhotoRequest

from app.services.facebook_service import (
    get_facebook_login_url,
    exchange_code_for_access_token,
    get_page_insights,
    get_user_pages,
    create_facebook_post,
    upload_facebook_photo,
)

from app.services.linkedin_service import (
    get_linkedin_login_url,
    exchange_code_for_access_token,
    get_linkedin_profile,
    create_linkedin_post,
)

from app.services.youtube_service import (
    get_youtube_login_url,
    exchange_code_for_access_token as exchange_youtube_token,
    get_channel_details,
    upload_video,
)

from app.services.instagram_service import (
    get_instagram_login_url,
    exchange_code_for_access_token as exchange_instagram_token,
    get_instagram_business_account,
    create_media_container,
    publish_media,
)

from app.services.twitter_service import (
    get_twitter_login_url,
    exchange_twitter_token,
    get_twitter_profile,
    publish_tweet,
)


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


# @router.get("/facebook/callback")
# def facebook_callback(code: str):
#     """
#     Facebook redirects here after login.
#     Exchange authorization code for access token.
#     """
#     try:
#         token_data = exchange_code_for_access_token(code)

#         return {
#             "message": "Facebook connected successfully",
#             "access_token": token_data["access_token"],
#             "token_type": token_data["token_type"],
#             "expires_in": token_data["expires_in"]
#         }

#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

@router.get("/facebook/callback")
def facebook_callback(code: str):
    try:
        token_data = exchange_code_for_access_token(code)

        access_token = token_data["access_token"]

        pages = get_user_pages(access_token)

        return {
            "message": "Facebook connected successfully",
            "pages": pages
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/facebook/post")
def publish_post(data: FacebookPostRequest):
    try:
        return create_facebook_post(
            data.page_id,
            data.page_access_token,
            data.message,
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )



@router.post("/facebook/photo")
def upload_photo(photo: FacebookPhotoRequest):
    return upload_facebook_photo(
        photo.page_id,
        photo.page_access_token,
        photo.image_url,
        photo.caption,
    )

@router.post("/facebook/insights")
def facebook_insights(data: FacebookInsightsRequest):
    return get_page_insights(
        data.page_id,
        data.page_access_token
    )
    
# ===========================
# Linkedin OAuth
# ===========================    

@router.get("/linkedin/connect")
def connect_linkedin():
    url = get_linkedin_login_url()
    return RedirectResponse(url=url)


@router.get("/linkedin/callback")
def linkedin_callback(code: str):
    db = SessionLocal()

    token_data = exchange_code_for_access_token(code)

    profile_data = get_linkedin_profile(
        token_data["access_token"]
    )

    # linkedin_account = SocialAccount(
    #     user_id=1,
    #     platform="linkedin",
    #     account_id=profile_data["sub"],
    #     account_name=profile_data["name"],
    #     access_token=token_data["access_token"],
    # )

    # db.add(linkedin_account)
    # db.commit()
    # db.refresh(linkedin_account)

    return {
        "message": "LinkedIn connected successfully",
        "access_token": token_data["access_token"],
        "profile": profile_data,
    }   


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
def connect_youtube():
    """
    Redirect user to Google OAuth Login.
    """
    url = get_youtube_login_url()
    return RedirectResponse(url=url)


@router.get("/youtube/callback")
def youtube_callback(code: str):
    try:
        token_data = exchange_youtube_token(code)

        channel_data = get_channel_details(
            token_data["access_token"]
        )

        return {
            "message": "YouTube connected successfully",
            "channel": channel_data,
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

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
def connect_twitter():
    url = get_twitter_login_url()
    return RedirectResponse(url=url)


@router.get("/twitter/callback")
def twitter_callback(code: str):
    token_data = exchange_twitter_token(code)

    profile = get_twitter_profile(
        token_data["access_token"]
    )

    return {
        "message": "X account connected successfully",
        "profile": profile,
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
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