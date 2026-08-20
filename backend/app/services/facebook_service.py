from urllib.parse import urlencode
import requests

from app.core.config import settings


def get_facebook_login_url():
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": ",".join([
            "pages_show_list",
            "pages_read_engagement",
            "pages_manage_posts",
            "business_management"
        ]),
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
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def get_user_pages(access_token: str):
    url = "https://graph.facebook.com/v23.0/me/accounts"

    params = {
        "access_token": access_token
    }

    response = requests.get(url, params=params)

    data = response.json()

    print("\n========== FACEBOOK RESPONSE ==========")
    print(data)
    print("ACCESS TOKEN =", access_token)
    print("=======================================\n")

    return data

def create_facebook_post(
    page_id: str,
    page_access_token: str,
    message: str,
):
    url = f"https://graph.facebook.com/v23.0/{page_id}/feed"

    payload = {
        "message": message,
        "access_token": page_access_token,
    }

    response = requests.post(url, data=payload)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def upload_facebook_photo(
    page_id: str,
    page_access_token: str,
    image_url: str,
    caption: str | None = None,
):
    url = f"https://graph.facebook.com/v23.0/{page_id}/photos"

    payload = {
        "url": image_url,
        "caption": caption or "",
        "published": "true",
        "access_token": page_access_token,
    }

    response = requests.post(url, data=payload, timeout=30)

    print("FACEBOOK PHOTO STATUS:", response.status_code)
    print("FACEBOOK PHOTO RESPONSE:", response.text)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def upload_facebook_video(
    page_id: str,
    page_access_token,
    video_url,
    description,
):
    url = f"https://graph.facebook.com/v23.0/{page_id}/videos"

    payload = {
        "file_url": video_url,
        "description": description,
        "access_token": page_access_token,
    }

    response = requests.post(url, data=payload)

    return response.json()


def get_page_insights(page_id, page_access_token):
    url = f"https://graph.facebook.com/v23.0/{page_id}/insights"

    params = {
        "metric": "page_impressions",
        "access_token": page_access_token,
    }

    response = requests.get(url, params=params)

    return response.json()