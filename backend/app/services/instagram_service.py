from urllib import response

import requests
from urllib.parse import urlencode

from app.core.config import settings


AUTH_URL = "https://www.instagram.com/oauth/authorize"
TOKEN_URL = "https://api.instagram.com/oauth/access_token"

def get_instagram_login_url():
    params = {
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "scope": "instagram_business_basic,instagram_business_content_publish",
        "response_type": "code",
    }

    url = f"{AUTH_URL}?{urlencode(params)}"

    print(url)

    return url

# def get_instagram_login_url():
#     print(settings.INSTAGRAM_REDIRECT_URI)
#     params = {
#         "client_id": settings.INSTAGRAM_CLIENT_ID,
#         "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
#         "scope": (
#             "instagram_business_basic,"
#             "instagram_business_content_publish"
#         ),
#         "response_type": "code",
#     }

#     return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code_for_access_token(code: str):

    payload = {
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "code": code,
    }

    response = requests.post(TOKEN_URL, data=payload)

    response.raise_for_status()

    return response.json()

def get_instagram_business_account(
    page_id: str,
    access_token: str,
):
    url = f"https://graph.facebook.com/v23.0/{page_id}"

    params = {
        "fields": "instagram_business_account",
        "access_token": access_token,
    }

    response = requests.get(url, params=params)

    return response.json()


def create_media_container(
    instagram_account_id,
    image_url,
    caption,
    access_token,
):
    url = (
        f"https://graph.facebook.com/v23.0/"
        f"{instagram_account_id}/media"
    )

    payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token,
    }

    response = requests.post(url, data=payload)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def publish_media(
    instagram_account_id,
    creation_id,
    access_token,
):
    url = (
        f"https://graph.facebook.com/v23.0/"
        f"{instagram_account_id}/media_publish"
    )

    payload = {
        "creation_id": creation_id,
        "access_token": access_token,
    }

    response = requests.post(url, data=payload)

    return response.json()


def publish_post(post, account) -> dict:
    """
    Publish an Instagram post through the common publishing pipeline.
    """

    print("🔥 INSTAGRAM publish_post() CALLED")
    print("Post ID:", post.id)
    print("Account ID:", account.id)
    print("Instagram ID:", account.platform_user_id)
    print("Has access token:", bool(account.access_token))

    try:
        instagram_account_id = account.platform_user_id
        access_token = account.access_token

        if not instagram_account_id or not access_token:
            return {
                "success": False,
                "failure_reason": "Missing Instagram account ID or access token.",
                "raw_response": {},
            }

        image_url = post.media_file_path
        caption = post.caption or ""

        if not image_url:
            return {
                "success": False,
                "failure_reason": "Instagram requires an image URL to publish this post.",
                "raw_response": {},
            }

        media = create_media_container(
            instagram_account_id=instagram_account_id,
            image_url=image_url,
            caption=caption,
            access_token=access_token,
        )

        creation_id = media.get("id")

        if not creation_id:
            return {
                "success": False,
                "failure_reason": "Instagram media container was not created.",
                "raw_response": media,
            }

        print("🔥 Instagram creation ID:", creation_id)

        result = publish_media(
            instagram_account_id=instagram_account_id,
            creation_id=creation_id,
            access_token=access_token,
        )

        if "error" in result:
            return {
                "success": False,
                "failure_reason": result["error"].get(
                    "message",
                    "Instagram publishing failed."
                ),
                "raw_response": result,
            }

        platform_post_id = result.get("id")

        print("🔥 Instagram platform post ID:", platform_post_id)

        return {
            "success": True,
            "platform_post_id": platform_post_id,
            "raw_response": result,
        }

    except Exception as e:
        print("🔥 INSTAGRAM PUBLISH ERROR:", repr(e))

        return {
            "success": False,
            "failure_reason": str(e),
            "raw_response": {},
        }
