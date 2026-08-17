import requests
from urllib.parse import urlencode

from app.core.config import settings


AUTH_URL = "https://www.facebook.com/v23.0/dialog/oauth"
TOKEN_URL = "https://graph.facebook.com/v23.0/oauth/access_token"
GRAPH_URL = "https://graph.facebook.com/v23.0"

SCOPES = [
    "business_management",
    "pages_show_list",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights",
]


def get_instagram_login_url():
    params = {
    "client_id": settings.INSTAGRAM_CLIENT_ID,
    "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
    "scope": ",".join(SCOPES),
    "response_type": "code",
    "state": "socialpilot",
    "config_id": settings.INSTAGRAM_CONFIGURATION_ID,
    }
    print("CLIENT ID:", settings.INSTAGRAM_CLIENT_ID)
    print("CONFIG ID:", settings.INSTAGRAM_CONFIGURATION_ID)
    print("REDIRECT URI:", settings.INSTAGRAM_REDIRECT_URI)
  
    url = f"{AUTH_URL}?{urlencode(params)}"
    print(url)

    return url

def exchange_code_for_access_token(code):
    print("Code received:", code)

    data = {
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "grant_type": "authorization_code",
        "code": code,
    }

    print(data)

    response = requests.post(TOKEN_URL, data=data)

    print("Status code:", response.status_code)
    print("Response:", response.text)

    return response.json()

def get_long_lived_access_token(short_lived_token: str):
    """Exchange short-lived token for long-lived token (60 days)"""
    url = f"{GRAPH_URL}/oauth/access_token"
    params = {
        "grant_type": "ig_exchange_token",
        "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
        "access_token": short_lived_token,
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    return response.json()


def get_instagram_user_info(access_token: str):
    """Get user's Instagram Business account info"""
    # Get connected Instagram Business accounts
    url = f"{GRAPH_URL}/me/accounts"
    params = {
        "access_token": access_token,
        "fields": "instagram_business_account{id,username,followers_count,profile_picture_url}",
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    
    data = response.json()
    accounts = data.get("data", [])
    
    instagram_accounts = []
    for account in accounts:
        ig_account = account.get("instagram_business_account")
        if ig_account:
            instagram_accounts.append(ig_account)
    
    if not instagram_accounts:
        raise Exception("No Instagram Business accounts found. You need an Instagram Business or Creator account connected to a Facebook Page.")
    
    # Return the first Instagram Business account
    ig = instagram_accounts[0]
    return {
        "platform_user_id": ig["id"],
        "username": ig.get("username", ""),
        "followers_count": ig.get("followers_count", 0),
        "profile_image": ig.get("profile_picture_url"),
    }

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