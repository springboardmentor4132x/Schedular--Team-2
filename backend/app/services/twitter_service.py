from urllib import response

import requests
from urllib.parse import urlencode

from app.core.config import settings

AUTH_URL = "https://twitter.com/i/oauth2/authorize"
TOKEN_URL = "https://api.x.com/2/oauth2/token"
API_URL = "https://api.x.com/2"

SCOPES = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access",
    "media.write",
]


def get_twitter_login_url(user_id: int):
    params = {
        "response_type": "code",
        "client_id": settings.TWITTER_CLIENT_ID,
        "redirect_uri": settings.TWITTER_REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "state": str(user_id),
        "code_challenge": "challenge",
        "code_challenge_method": "plain",
    }

    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_twitter_token(code: str):
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
        timeout=30
    )

    if response.status_code != 200:
        raise Exception(response.text)
    return response.json()


def get_twitter_user_info(access_token: str):
    """Get user's Twitter/X profile info"""

    url = f"{API_URL}/users/me"

    params = {
        "user.fields": "username,name,public_metrics,profile_image_url",
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.get(
        url,
        params=params,
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json().get("data", {})
    metrics = data.get("public_metrics", {})

    return {
        "platform_user_id": data.get("id"),
        "username": data.get("username", ""),
        "followers_count": metrics.get("followers_count", 0),
        "profile_image": data.get("profile_image_url"),
    }

def publish_tweet(access_token: str, message: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "text": message,
    }

    response = requests.post(
    "   https://api.twitter.com/2/tweets",
        headers=headers,
        json=payload,
    )
    
    print("*" * 50)
    print(access_token)
    print("=" * 50)
    print(len(access_token))
    print("=" * 50)
    print("STATUS:", response.status_code)
    print("HEADERS:", response.headers)
    print("BODY:", response.text)
    print("=" * 50)

    return {
        "status_code": response.status_code,
        "response": response.text,
    }