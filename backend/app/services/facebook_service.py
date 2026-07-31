from urllib.parse import urlencode
import requests

from app.core.config import settings


def get_facebook_login_url():
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": "pages_show_list,pages_read_engagement",
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
        "state": "socialpilot",  # Optional: You can include a state parameter for CSRF protection
    }

    response = requests.get(url, params=params, timeout=30)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()