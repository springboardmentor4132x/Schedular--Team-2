import requests
from urllib.parse import urlencode

from app.core.config import settings

AUTH_URL = "https://twitter.com/i/oauth2/authorize"
TOKEN_URL = "https://api.x.com/2/oauth2/token"

SCOPES = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access",
]


def get_twitter_login_url():
    params = {
        "response_type": "code",
        "client_id": settings.TWITTER_CLIENT_ID,
        "redirect_uri": settings.TWITTER_REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "state": "twitter_oauth",
        "code_challenge": "challenge",
        "code_challenge_method": "plain",
    }

    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code_for_access_token(code: str):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.TWITTER_REDIRECT_URI,
        "client_id": settings.TWITTER_CLIENT_ID,
        "code_verifier": "challenge",
    }

    response = requests.post(
        TOKEN_URL,
        data=data,
        auth=(settings.TWITTER_CLIENT_ID, settings.TWITTER_CLIENT_SECRET),
    )

    response.raise_for_status()
    return response.json()



