from urllib.parse import urlencode
import requests
from pathlib import Path
from app.core.config import settings
from datetime import datetime, timezone
from app.models.post import Post
from app.models.social_account import SocialAccount

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
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
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2.credentials import Credentials

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

def upload_video_from_file(
    access_token: str,
    file_bytes: bytes,
    title: str,
    description: str,
    filename: str = "video.mp4",
    refresh_token: str = None,
) -> dict:
    """Upload video from binary bytes to YouTube."""
    import tempfile
    import os
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2.credentials import Credentials

    suffix = os.path.splitext(filename)[1] if filename else ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    media = None
    try:
        # ✅ Pass all required fields so Google can refresh token if needed
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.YOUTUBE_CLIENT_ID,
            client_secret=settings.YOUTUBE_CLIENT_SECRET,
        )

        youtube = build("youtube", "v3", credentials=credentials)

        request_body = {
            "snippet": {
                "title": title,
                "description": description,
            },
            "status": {
                "privacyStatus": "public",
            },
        }

        media = MediaFileUpload(tmp_path, resumable=True)

        request = youtube.videos().insert(
            part="snippet,status",
            body=request_body,
            media_body=media,
        )

        response = request.execute()
        return response

    finally:
        if media is not None:
            try:
                media._fd.close()
            except Exception:
                pass
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except Exception as e:
            print(f"Warning: Could not delete temp file {tmp_path}: {e}")

# ---------------------------------------------------------
# publish_post — called by dispatch_publish in publishing_service.py
# ---------------------------------------------------------


def publish_post(post: Post, account: SocialAccount) -> dict:
    """
    Entry point called by the publishing queue dispatcher.
    YouTube only supports video content — text/image posts are not supported.
    """
    try:
        if post.content_type != "video" or not post.media_file_path:
            return {
                "success": False,
                "failure_reason": "YouTube only supports video posts. Please attach a video file.",
                "raw_response": {},
            }

        # Convert stored URL path to local filesystem path
        media_path = Path.cwd() / post.media_file_path.lstrip("/\\")

        print("🔥 YOUTUBE MEDIA DEBUG")
        print("Stored path:", post.media_file_path)
        print("Resolved path:", media_path)
        print("File exists:", media_path.exists())

        if not media_path.exists():
            return {
                "success": False,
                "failure_reason": f"Video file not found: {media_path}",
                "raw_response": {},
            }

        response = upload_video(
            access_token=account.access_token,
            video_path=str(media_path),
            title=post.title or "Untitled Video",
            description=post.caption or "",
        )

        video_id = response.get("id")

        return {
            "success": True,
            "platform_post_id": video_id,
            "raw_response": response,
        }

    except Exception as e:
        return {
            "success": False,
            "failure_reason": str(e),
            "raw_response": {},
        }

    
# def publish_post(post: Post, account: SocialAccount) -> dict:
#     """
#     Entry point called by the publishing queue dispatcher.
#     YouTube only supports video content — text/image posts are not supported.
#     """
#     try:
#         if post.content_type != "video" or not post.media_file_path:
#             return {
#                 "success": False,
#                 "failure_reason": "YouTube only supports video posts. Please attach a video file.",
#                 "raw_response": {},
#             }

#         response = upload_video(
#             access_token=account.access_token,
#             video_path=post.media_file_path,
#             title=post.title or "Untitled Video",
#             description=post.caption or "",
#         )

#         video_id = response.get("id")

#         return {
#             "success": True,
#             "platform_post_id": video_id,
#             "raw_response": response,
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "failure_reason": str(e),
#             "raw_response": {},
#         }


# ---------------------------------------------------------
# Refresh access token using refresh token
# ---------------------------------------------------------

def refresh_access_token(refresh_token: str) -> dict:
    """Exchange refresh token for a new access token."""
    data = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    response = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=30)
    if response.status_code != 200:
        raise Exception(f"Token refresh failed: {response.text}")
    return response.json()

def get_fresh_access_token(account) -> str:
    """Check if token expired — refresh it automatically if needed."""
    # Token still valid
    if account.token_expires_at and account.token_expires_at > datetime.now(timezone.utc):
        return account.access_token

    # Token expired — use refresh token to get new one
    if not account.refresh_token:
        raise Exception("No refresh token available. Please reconnect your YouTube account.")

    data = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "refresh_token": account.refresh_token,
        "grant_type": "refresh_token",
    }
    response = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=30)
    if response.status_code != 200:
        raise Exception(f"Token refresh failed: {response.text}")

    return response.json()["access_token"]


# ---------------------------------------------------------
# Analytics — Video metrics
# ---------------------------------------------------------

def get_video_analytics(access_token: str, video_id: str) -> dict:
    """Get performance metrics for a specific YouTube video."""
    headers = {"Authorization": f"Bearer {access_token}"}

    # Video statistics (views, likes, comments)
    stats_url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "statistics",
        "id": video_id,
    }
    resp = requests.get(stats_url, headers=headers, params=params, timeout=30)

    likes = 0
    comments = 0
    views = 0
    impressions = 0
    clicks = 0

    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if items:
            stats = items[0].get("statistics", {})
            likes = int(stats.get("likeCount", 0))
            comments = int(stats.get("commentCount", 0))
            views = int(stats.get("viewCount", 0))

    # YouTube Analytics API for impressions and clicks
    analytics_url = "https://youtubeanalytics.googleapis.com/v2/reports"
    analytics_params = {
        "ids": "channel==MINE",
        "metrics": "impressions,impressionClickThroughRate",
        "dimensions": "video",
        "filters": f"video=={video_id}",
        "startDate": "2020-01-01",
        "endDate": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    analytics_resp = requests.get(
        analytics_url, headers=headers, params=analytics_params, timeout=30
    )
    print("🔥 CHANNEL ANALYTICS STATUS:", analytics_resp.status_code)
    print("🔥 CHANNEL ANALYTICS RESPONSE:", analytics_resp.text)
    if analytics_resp.status_code == 200:
        rows = analytics_resp.json().get("rows", [])
        if rows:
            impressions = int(rows[0][1]) if len(rows[0]) > 1 else 0
            ctr = float(rows[0][2]) if len(rows[0]) > 2 else 0.0
            clicks = int(impressions * ctr / 100)

    engagement = likes + comments
    engagement_rate = round((engagement / views) * 100, 2) if views > 0 else 0.0

    return {
        "platform": "youtube",
        "likes": likes,
        "comments": comments,
        "shares": 0,
        "saves": 0,
        "reach": views,
        "impressions": impressions if impressions > 0 else views,
        "clicks": clicks,
        "engagement_rate": engagement_rate,
    }


# ---------------------------------------------------------
# Analytics — Channel/subscriber stats
# ---------------------------------------------------------

def get_channel_analytics(access_token: str) -> dict:
    """Get subscriber count and channel-level growth stats."""
    headers = {"Authorization": f"Bearer {access_token}"}

    # Channel statistics
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {"part": "statistics", "mine": "true"}
    resp = requests.get(url, headers=headers, params=params, timeout=30)
    print("🔥 CHANNEL API STATUS:", resp.status_code)
    print("🔥 CHANNEL API RESPONSE:", resp.text)

    followers = 0
    new_followers = 0
    lost_followers = 0

    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if items:
            stats = items[0].get("statistics", {})
            followers = int(stats.get("subscriberCount", 0))

    # YouTube Analytics for subscriber gains/losses
    analytics_url = "https://youtubeanalytics.googleapis.com/v2/reports"
    analytics_params = {
        "ids": "channel==MINE",
        "metrics": "subscribersGained,subscribersLost",
        "startDate": datetime.now(timezone.utc).strftime("%Y-%m-01"),
        "endDate": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    analytics_resp = requests.get(
        analytics_url, headers=headers, params=analytics_params, timeout=30
    )
    if analytics_resp.status_code == 200:
        rows = analytics_resp.json().get("rows", [])
        if rows:
            new_followers = int(rows[0][0]) if len(rows[0]) > 0 else 0
            lost_followers = int(rows[0][1]) if len(rows[0]) > 1 else 0

    return {
        "platform": "youtube",
        "followers": followers,
        "new_followers": new_followers,
        "lost_followers": lost_followers,
        "gender_distribution": None,
        "age_distribution": None,
        "country_distribution": None,
        "city_distribution": None,
        "most_active_hours": None,
        "most_active_days": None,
    }


# ---------------------------------------------------------
# Platform-level snapshot (for platform_analytics table)
# ---------------------------------------------------------

def get_platform_snapshot(access_token: str) -> dict:
    """Get channel-level performance for platform_analytics table."""
    headers = {"Authorization": f"Bearer {access_token}"}

    analytics_url = "https://youtubeanalytics.googleapis.com/v2/reports"
    params = {
        "ids": "channel==MINE",
        "metrics": "views,estimatedMinutesWatched,likes,comments,shares",
        "startDate": datetime.now(timezone.utc).strftime("%Y-%m-01"),
        "endDate": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    resp = requests.get(analytics_url, headers=headers, params=params, timeout=30)

    views = 0
    engagement = 0
    clicks = 0

    if resp.status_code == 200:
        rows = resp.json().get("rows", [])
        if rows:
            views = int(rows[0][0]) if len(rows[0]) > 0 else 0
            likes = int(rows[0][2]) if len(rows[0]) > 2 else 0
            comments = int(rows[0][3]) if len(rows[0]) > 3 else 0
            shares = int(rows[0][4]) if len(rows[0]) > 4 else 0
            engagement = likes + comments + shares

    channel_data = get_channel_analytics(access_token)

    return {
        "followers": channel_data["followers"],
        "reach": views,
        "impressions": views,
        "engagement": engagement,
        "clicks": clicks,
        "snapshot_date": datetime.now(timezone.utc).date(),
    }


# ---------------------------------------------------------
# Sync analytics to DB
# ---------------------------------------------------------

def sync_post_analytics_to_db(db, post, account: SocialAccount):
    """Fetch YouTube video metrics and save to post_analytics table."""
    from app.models.post_analytics import PostAnalytics

    if not post.platform_post_id:
        return

    try:
        metrics = get_video_analytics(account.access_token, post.platform_post_id)

        existing = db.query(PostAnalytics).filter(
            PostAnalytics.post_id == post.id
        ).first()

        if existing:
            existing.likes = metrics["likes"]
            existing.comments = metrics["comments"]
            existing.shares = metrics["shares"]
            existing.reach = metrics["reach"]
            existing.impressions = metrics["impressions"]
            existing.clicks = metrics["clicks"]
            existing.engagement_rate = metrics["engagement_rate"]
            existing.last_synced = datetime.now(timezone.utc)
        else:
            db.add(PostAnalytics(
                post_id=post.id,
                platform="youtube",
                likes=metrics["likes"],
                comments=metrics["comments"],
                shares=metrics["shares"],
                saves=0,
                reach=metrics["reach"],
                impressions=metrics["impressions"],
                clicks=metrics["clicks"],
                engagement_rate=metrics["engagement_rate"],
                last_synced=datetime.now(timezone.utc),
            ))
        db.commit()
    except Exception as e:
        print(f"YouTube analytics sync failed for post {post.id}: {e}")


def sync_audience_analytics_to_db(db, account: SocialAccount):
    """Fetch YouTube subscriber stats and save to audience_analytics table."""
    from app.models.audience_analytics import AudienceAnalytics

    try:
        # stats = get_channel_analytics(account.access_token)
        access_token = get_fresh_access_token(account)
        stats = get_channel_analytics(access_token)
        print("===============YOUTUBE AUDIENCE STATS===========",stats)

        existing = db.query(AudienceAnalytics).filter(
            AudienceAnalytics.social_account_id == account.id
        ).first()

        if existing:
            existing.followers = stats["followers"]
            existing.new_followers = stats["new_followers"]
            existing.lost_followers = stats["lost_followers"]
            existing.last_synced = datetime.now(timezone.utc)
        else:
            db.add(AudienceAnalytics(
                social_account_id=account.id,
                platform="youtube",
                followers=stats["followers"],
                new_followers=stats["new_followers"],
                lost_followers=stats["lost_followers"],
                last_synced=datetime.now(timezone.utc),
            ))
        db.commit()
        print("=== AUDIENCE ANALYTICS SAVED ===") 
    except Exception as e:
        print(f"YouTube audience sync failed for account {account.id}: {e}")


def sync_platform_snapshot_to_db(db, account: SocialAccount):
    """Save daily YouTube performance snapshot to platform_analytics table."""
    from app.models.platform_analytics import PlatformAnalytics

    try:
        snapshot = get_platform_snapshot(account.access_token)
        today = snapshot["snapshot_date"]

        existing = db.query(PlatformAnalytics).filter(
            PlatformAnalytics.social_account_id == account.id,
            PlatformAnalytics.snapshot_date == today,
        ).first()

        if existing:
            existing.followers = snapshot["followers"]
            existing.reach = snapshot["reach"]
            existing.impressions = snapshot["impressions"]
            existing.engagement = snapshot["engagement"]
            existing.clicks = snapshot["clicks"]
            existing.last_synced = datetime.now(timezone.utc)
        else:
            db.add(PlatformAnalytics(
                social_account_id=account.id,
                platform_name="youtube",
                followers=snapshot["followers"],
                reach=snapshot["reach"],
                impressions=snapshot["impressions"],
                engagement=snapshot["engagement"],
                clicks=snapshot["clicks"],
                snapshot_date=today,
                last_synced=datetime.now(timezone.utc),
            ))
        db.commit()
    except Exception as e:
        print(f"YouTube platform snapshot failed for account {account.id}: {e}")