import requests
from urllib.parse import urlencode

from app.core.config import settings


AUTH_URL = "https://www.pinterest.com/oauth/"
TOKEN_URL = "https://api.pinterest.com/v5/oauth/token"
API_URL = "https://api.pinterest.com/v5"

SCOPES = [
    "boards:read",
    "boards:write",
    "pins:read",
    "pins:write",
    "user_accounts:read",
]


def get_pinterest_login_url():
    params = {
        "client_id": settings.PINTEREST_CLIENT_ID,
        "redirect_uri": settings.PINTEREST_REDIRECT_URI,
        "response_type": "code",
        "scope": ",".join(SCOPES),
        "state": "socialpilot",
    }

    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code_for_access_token(code: str):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.PINTEREST_REDIRECT_URI,
    }

    response = requests.post(
        TOKEN_URL,
        data=data,
        auth=(settings.PINTEREST_CLIENT_ID, settings.PINTEREST_CLIENT_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def get_pinterest_user_info(access_token: str):
    """Get user's Pinterest profile info"""
    url = f"{API_URL}/user_account"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.get(url, headers=headers, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())

    data = response.json()

    return {
        "platform_user_id": data.get("id"),
        "username": data.get("username", ""),
        "followers_count": 0,
        "profile_image": data.get("profile_image"),
    }
