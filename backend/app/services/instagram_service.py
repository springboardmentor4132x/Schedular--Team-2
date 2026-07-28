import requests
from urllib.parse import urlencode

from app.core.config import settings


AUTH_URL = "https://www.instagram.com/oauth/authorize"
TOKEN_URL = "https://api.instagram.com/oauth/access_token"


def get_instagram_login_url():
    print(settings.INSTAGRAM_REDIRECT_URI)
    params = {
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "scope": "instagram_business_basic,instagram_business_content_publish",
        "response_type": "code",
    }

    return f"{AUTH_URL}?{urlencode(params)}"


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

