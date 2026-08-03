from urllib import response

import requests
from urllib.parse import urlencode

from app.core.config import settings


AUTH_URL = "https://www.instagram.com/oauth/authorize"
TOKEN_URL = "https://api.instagram.com/oauth/access_token"
GRAPH_URL = "https://graph.facebook.com/v23.0"

def get_instagram_login_url():
    params = {
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "scope": "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights",
        "response_type": "code",
        "state": "socialpilot",
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

    response = requests.post(TOKEN_URL, data=payload, timeout=30)

    response.raise_for_status()

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

