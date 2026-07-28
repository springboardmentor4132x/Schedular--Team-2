from urllib.parse import urlencode
import requests

from app.core.config import settings

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"


def get_youtube_login_url():
    params = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/youtube.readonly",
        "access_type": "offline",
        "prompt": "consent",
    }

    return GOOGLE_AUTH_URL + "?" + urlencode(params)


def exchange_code_for_access_token(code: str):
    data = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "grant_type": "authorization_code",
        "code": code,
    }

    response = requests.post(GOOGLE_TOKEN_URL, data=data)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()