from urllib.parse import urlencode
import requests

from app.core.config import settings
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
]

def get_youtube_login_url():
    params = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": "youtube_oauth",
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

    response = requests.post(
        GOOGLE_TOKEN_URL, 
        data=data,
        timeout=30,
        )

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()

def get_youtube_user_info(access_token: str):
    """Get user's YouTube channel info"""
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "snippet,statistics",
        "mine": "true",
        "access_token": access_token,
    }
    response = requests.get(url, params=params, timeout=30)

    if response.status_code != 200:
        raise Exception(response.json())
    
    data = response.json()
    items = data.get("items", [])

    if not items:
        raise Exception("No YouTube channel found")
    
    channel = items[0]
    snippet = channel.get("snippet", {})
    stats = channel.get("statistics", {})
    
    return {
        "platform_user_id": channel["id"],
        "username": 
            snippet.get("customUrl", "").replace("@", "") 
            or snippet.get("title", "").replace(" ", "").lower(),
        "followers_count": int(stats.get("subscriberCount", 0)),
        "profile_image": 
            snippet.get("thumbnails", {})
            .get("high", {})       
            .get("url") 
            or snippet.get("thumbnails", {})
            .get("default", {})
            .get("url"),
    }


def get_channel_details(access_token: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    params = {
        "part": "snippet,statistics",
        "mine": "true",
    }

    response = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        headers=headers,
        params=params,
    )

    response.raise_for_status()

    return response.json()


def upload_video(
    access_token: str,
    video_path: str,
    title: str,
    description: str,
):
    credentials = Credentials(token=access_token)

    youtube = build(
        "youtube",
        "v3",
        credentials=credentials,
    )

    request_body = {
        "snippet": {
            "title": title,
            "description": description,
        },
        "status": {
            "privacyStatus": "public",
        },
    }

    media_file = MediaFileUpload(
        video_path,
        resumable=True,
    )

    request = youtube.videos().insert(
        part="snippet,status",
        body=request_body,
        media_body=media_file,
    )

    response = request.execute()

    return response

