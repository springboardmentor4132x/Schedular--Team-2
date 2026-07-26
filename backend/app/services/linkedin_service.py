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
        "scope": "openid profile email",
    }

    url = LINKEDIN_AUTH_URL + "?" + urlencode(params)

    print("\n========== LINKEDIN URL ==========")
    print(url)
    print("=================================\n")

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
    )

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()