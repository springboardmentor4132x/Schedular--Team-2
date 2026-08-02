from urllib.parse import urlencode
import requests

from app.core.config import settings

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


def get_linkedin_login_url():
    params = {
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "scope": "openid profile email w_member_social",
        "state": "socialpilot",
    }

    url = LINKEDIN_AUTH_URL + "?" + urlencode(params)

    return url


def exchange_code_for_access_token(code: str):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "client_secret": settings.LINKEDIN_CLIENT_SECRET,
    }

    response = requests.post(
        LINKEDIN_TOKEN_URL,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def get_linkedin_user_info(access_token: str):
    """Get user's LinkedIn profile info"""
    # Get user profile
    url = "https://api.linkedin.com/v2/userinfo"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.get(url, headers=headers, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    
    profile = response.json()
    
    return {
        "platform_user_id": profile.get("sub"),
        "username": profile.get("name", "").replace(" ", "").lower(),
        "followers_count": 0,
        "profile_image": profile.get("picture"),
    }