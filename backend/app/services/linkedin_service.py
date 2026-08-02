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

    if response.status_code not in [200, 201]:
        raise Exception(response.json())

    return response.json()

def get_linkedin_profile(access_token: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    response = requests.get(
        "https://api.linkedin.com/v2/userinfo",
        headers=headers,
    )

    print("Status code:", response.status_code)
    print("Response:", response.text)

    return response.json()


def create_linkedin_post(
    access_token: str,
    author_id: str,
    message: str,
):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    payload = {
        "author": f"urn:li:person:{author_id}",
        "commentary": message,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED"
        },
        "lifecycleState": "PUBLISHED",
    }

    print(headers)
    print(payload)
    
    response = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=headers,
        json={
            "author": f"urn:li:person:{author_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": message
                    },
                    "shareMediaCategory": "NONE"
                }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    },
)

    return {
        "status_code": response.status_code,
        "headers": dict(response.headers),
        "body": response.json(),
    }