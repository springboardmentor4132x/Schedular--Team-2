from urllib.parse import urlencode
import requests

from app.core.config import settings


def get_facebook_login_url():
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": "pages_show_list,pages_read_engagement,pages_read_user_content",
        "response_type": "code",
    }

    return (
        "https://www.facebook.com/v23.0/dialog/oauth?"
        + urlencode(params)
    )


def exchange_code_for_access_token(code: str):
    url = "https://graph.facebook.com/v23.0/oauth/access_token"

    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "client_secret": settings.FACEBOOK_CLIENT_SECRET,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "code": code,
        "state": "socialpilot",
    }

    response = requests.get(url, params=params, timeout=30)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def get_long_lived_access_token(short_lived_token: str):
    """Exchange short-lived token for long-lived token (60 days)"""
    url = "https://graph.facebook.com/v23.0/oauth/access_token"
    params = {
        "grant_type": "fb_exchange_token",
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "client_secret": settings.FACEBOOK_CLIENT_SECRET,
        "fb_exchange_token": short_lived_token,
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    return response.json()


def get_facebook_user_info(access_token: str):
    """Get user's Facebook pages and profile info"""
    # Get user's pages
    url = "https://graph.facebook.com/v23.0/me/accounts"
    params = {
        "access_token": access_token,
        "fields": "id,name,username,fan_count,picture{url}",
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    
    pages = response.json().get("data", [])
    if not pages:
        raise Exception("No Facebook pages found. You need a Facebook Page to connect.")
    
    # Return the first page (in production, let user choose)
    page = pages[0]
    return {
        "platform_user_id": page["id"],
        "username": page.get("username", page["name"]),
        "followers_count": page.get("fan_count", 0),
        "profile_image": page.get("picture", {}).get("data", {}).get("url"),
    }