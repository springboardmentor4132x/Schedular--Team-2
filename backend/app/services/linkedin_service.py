from urllib.parse import urlencode
import requests
from app.core.config import settings
import json
from datetime import datetime, timezone
from app.models.post import Post
from app.models.social_account import SocialAccount

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

    print("CLIENT ID:", settings.LINKEDIN_CLIENT_ID)
    print("REDIRECT URI:", settings.LINKEDIN_REDIRECT_URI)

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
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )

    print("CLIENT ID:", settings.LINKEDIN_CLIENT_ID)
    print("REDIRECT URI:", settings.LINKEDIN_REDIRECT_URI)
    print("TOKEN STATUS:", response.status_code)
    print("TOKEN RESPONSE:", response.text)

    if response.status_code not in [200, 201]:
        raise Exception(response.json())

    return response.json()


def get_linkedin_user_info(access_token: str):
    """Get user's LinkedIn profile info"""
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


def get_linkedin_profile(access_token: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    response = requests.get(
        "https://api.linkedin.com/v2/userinfo",
        headers=headers,
        timeout=30
    )

    print("Status code:", response.status_code)
    print("Response:", response.text)

    return response.json()


def create_linkedin_post(
    access_token: str,
    author_id: str,
    message: str,
):
    """Publishes a text post using LinkedIn's current Posts API (/rest/posts)."""
    url = "https://api.linkedin.com/rest/posts"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "LinkedIn-Version": "202601",            # Required versioned date format (YYYYMM)
        "X-Restli-Protocol-Version": "2.0.0",
    }

    # Safety wrapper: ensures the URN format is correct even if a raw ID is passed
    if not author_id.startswith("urn:li:"):
        author_id = f"urn:li:person:{author_id}"

    payload = {
        "author": author_id,                     
        "commentary": message,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
    }

    response = requests.post(url, headers=headers, json=payload, timeout=30)

    print("LinkedIn Post Status:", response.status_code)
    print("LinkedIn Post Response:", response.text)

    if response.status_code not in [200, 201]:
        raise Exception(response.text)

    # LinkedIn returns the created post ID in the 'x-restli-id' response header on 201 Created
    post_id = response.headers.get("x-restli-id", "Successfully Published")
    
    return {
        "status_code": response.status_code,
        "linkedin_post_id": post_id,
        "body": response.json() if response.text else {"id": post_id},
    }


# ---------------------------------------------------------
# publish_post — called by dispatch_publish in publishing_service.py
# ---------------------------------------------------------

def publish_post(post: Post, account: SocialAccount) -> dict:
    """
    Entry point called by the publishing queue dispatcher.
    Routes to text, image, or video publishing based on content_type.
    """
    try:
        author_urn = f"urn:li:person:{account.platform_user_id}"

        if post.content_type == "text" or not post.media_file_path:
            result = create_linkedin_post(
                access_token=account.access_token,
                author_id=author_urn,
                message=post.caption or "",
            )
        elif post.content_type == "image":
            from pathlib import Path

            media_path = Path.cwd() / post.media_file_path.lstrip("/\\")

            if not media_path.exists():
                raise Exception(f"LinkedIn image file not found: {media_path}")

            with open(media_path, "rb") as image_file:
                file_bytes = image_file.read()

            result = publish_image_post_from_file(
                access_token=account.access_token,
                author_id=author_urn,
                file_bytes=file_bytes,
                caption=post.caption or "",
            )
            
        elif post.content_type == "video":
            from pathlib import Path

            media_path = Path.cwd() / post.media_file_path.lstrip("/\\")

            if not media_path.exists():
                raise Exception(f"LinkedIn video file not found: {media_path}")

            with open(media_path, "rb") as video_file:
                file_bytes = video_file.read()

            result = publish_video_post_from_file(
                access_token=account.access_token,
                author_id=author_urn,
                file_bytes=file_bytes,
                caption=post.caption or "",
            )
        else:
            result = create_linkedin_post(
                access_token=account.access_token,
                author_id=author_urn,
                message=post.caption or "",
            )

        return {
            "success": True,
            "platform_post_id": result.get("linkedin_post_id"),
            "raw_response": result,
        }

    except Exception as e:
        return {
            "success": False,
            "failure_reason": str(e),
            "raw_response": {},
        }


# ---------------------------------------------------------
# Image post
# ---------------------------------------------------------

def publish_image_post_from_file(
    access_token: str,
    author_id: str,
    file_bytes: bytes,
    caption: str,
) -> dict:
    """Upload image from binary bytes then publish post."""
    if not author_id.startswith("urn:li:"):
        author_id = f"urn:li:person:{author_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "LinkedIn-Version": "202601",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    # Step 1 — Initialize image upload
    init_url = "https://api.linkedin.com/rest/images?action=initializeUpload"
    init_payload = {"initializeUploadRequest": {"owner": author_id}}
    init_resp = requests.post(init_url, headers=headers, json=init_payload, timeout=30)
    if init_resp.status_code not in [200, 201]:
        raise Exception(f"Image init failed: {init_resp.text}")

    upload_data = init_resp.json().get("value", {})
    upload_url = upload_data.get("uploadUrl")
    image_urn = upload_data.get("image")

    # Step 2 — Upload binary directly
    upload_resp = requests.put(
        upload_url,
        data=file_bytes,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=60,
    )
    if upload_resp.status_code not in [200, 201]:
        raise Exception(f"Image upload failed: {upload_resp.text}")

    # Step 3 — Publish post with image
    post_url = "https://api.linkedin.com/rest/posts"
    payload = {
        "author": author_id,
        "commentary": caption,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "content": {
            "media": {
                "title": caption[:100] if caption else "Post",
                "id": image_urn,
            }
        },
        "lifecycleState": "PUBLISHED",
    }
    post_resp = requests.post(post_url, headers=headers, json=payload, timeout=30)
    if post_resp.status_code not in [200, 201]:
        raise Exception(f"Image post failed: {post_resp.text}")

    post_id = post_resp.headers.get("x-restli-id", "published")
    return {"linkedin_post_id": post_id, "type": "image"}


def publish_video_post_from_file(
    access_token: str,
    author_id: str,
    file_bytes: bytes,
    caption: str,
) -> dict:
    """Upload video from binary bytes then publish post."""
    if not author_id.startswith("urn:li:"):
        author_id = f"urn:li:person:{author_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "LinkedIn-Version": "202601",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    file_size = len(file_bytes)

    # Step 1 — Initialize video upload
    init_url = "https://api.linkedin.com/rest/videos?action=initializeUpload"
    init_payload = {
        "initializeUploadRequest": {
            "owner": author_id,
            "fileSizeBytes": file_size,
            "uploadCaptions": False,
            "uploadThumbnail": False,
        }
    }
    init_resp = requests.post(init_url, headers=headers, json=init_payload, timeout=30)
    if init_resp.status_code not in [200, 201]:
        raise Exception(f"Video init failed: {init_resp.text}")

    upload_data = init_resp.json().get("value", {})
    upload_instructions = upload_data.get("uploadInstructions", [])
    video_urn = upload_data.get("video")
    upload_token = upload_data.get("uploadToken", "")

    # Step 2 — Upload chunks
    etags = []
    for instruction in upload_instructions:
        upload_url = instruction.get("uploadUrl")
        first_byte = instruction.get("firstByte", 0)
        last_byte = instruction.get("lastByte", file_size - 1)
        chunk = file_bytes[first_byte:last_byte + 1]

        chunk_resp = requests.put(
            upload_url,
            data=chunk,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=120,
        )
        if chunk_resp.status_code not in [200, 201]:
            raise Exception(f"Video chunk upload failed: {chunk_resp.text}")
        etags.append(chunk_resp.headers.get("etag", ""))

    # Step 3 — Finalize
    finalize_url = "https://api.linkedin.com/rest/videos?action=finalizeUpload"
    finalize_payload = {
        "finalizeUploadRequest": {
            "video": video_urn,
            "uploadToken": upload_token,
            "uploadedPartIds": etags,
        }
    }
    requests.post(finalize_url, headers=headers, json=finalize_payload, timeout=30)

    # Step 4 — Publish post
    post_url = "https://api.linkedin.com/rest/posts"
    payload = {
        "author": author_id,
        "commentary": caption,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "content": {
            "media": {
                "title": caption[:100] if caption else "Video",
                "id": video_urn,
            }
        },
        "lifecycleState": "PUBLISHED",
    }
    post_resp = requests.post(post_url, headers=headers, json=payload, timeout=30)
    if post_resp.status_code not in [200, 201]:
        raise Exception(f"Video post failed: {post_resp.text}")

    post_id = post_resp.headers.get("x-restli-id", "published")
    return {"linkedin_post_id": post_id, "type": "video"}

# ---------------------------------------------------------
# Analytics — Post metrics
# ---------------------------------------------------------

def get_post_analytics(access_token: str, post_urn: str) -> dict:
    """Get engagement metrics for a specific LinkedIn post."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": "202601",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    # Social actions (likes, comments, shares)
    social_url = "https://api.linkedin.com/rest/socialMetadata"
    params = {"q": "urn", "urn": post_urn}
    social_resp = requests.get(social_url, headers=headers, params=params, timeout=30)

    likes = 0
    comments = 0
    shares = 0
    impressions = 0
    clicks = 0

    if social_resp.status_code == 200:
        data = social_resp.json()
        likes = data.get("likeCount", 0)
        comments = data.get("commentCount", 0)
        shares = data.get("shareCount", 0)

    # Post statistics (impressions, clicks)
    stats_url = "https://api.linkedin.com/rest/organizationalEntityShareStatistics"
    stats_params = {
        "q": "organizationalEntity",
        "shares[0]": post_urn,
    }
    stats_resp = requests.get(stats_url, headers=headers, params=stats_params, timeout=30)
    if stats_resp.status_code == 200:
        elements = stats_resp.json().get("elements", [])
        if elements:
            stats = elements[0].get("totalShareStatistics", {})
            impressions = stats.get("impressionCount", 0)
            clicks = stats.get("clickCount", 0)

    engagement = likes + comments + shares
    engagement_rate = round((engagement / impressions) * 100, 2) if impressions > 0 else 0.0

    return {
        "platform": "linkedin",
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": 0,
        "reach": impressions,
        "impressions": impressions,
        "clicks": clicks,
        "engagement_rate": engagement_rate,
    }


# ---------------------------------------------------------
# Analytics — Follower/audience stats
# ---------------------------------------------------------

def get_follower_stats(access_token: str, author_urn: str) -> dict:
    """Get follower count and growth stats for a LinkedIn member."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": "202601",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    url = "https://api.linkedin.com/v2/userinfo"
    resp = requests.get(url, headers=headers, timeout=30)

    followers = 0
    if resp.status_code == 200:
        data = resp.json()
        followers = data.get("followersCount", 0)

    return {
        "platform": "linkedin",
        "followers": followers,
        "new_followers": 0,
        "lost_followers": 0,
        "gender_distribution": None,
        "age_distribution": None,
        "country_distribution": None,
        "city_distribution": None,
        "most_active_hours": None,
        "most_active_days": None,
    }


# ---------------------------------------------------------
# Sync analytics to DB (called periodically or after publish)
# ---------------------------------------------------------

def sync_post_analytics_to_db(db, post, account: SocialAccount):
    """Fetch LinkedIn post metrics and save to post_analytics table."""
    from app.models.post_analytics import PostAnalytics

    if not post.platform_post_id:
        return

    try:
        metrics = get_post_analytics(account.access_token, post.platform_post_id)

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
                platform="linkedin",
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
        print(f"LinkedIn analytics sync failed for post {post.id}: {e}")


def sync_audience_analytics_to_db(db, account: SocialAccount):
    """Fetch LinkedIn follower stats and save to audience_analytics table."""
    from app.models.audience_analytics import AudienceAnalytics

    try:
        author_urn = f"urn:li:person:{account.platform_user_id}"
        stats = get_follower_stats(account.access_token, author_urn)

        existing = db.query(AudienceAnalytics).filter(
            AudienceAnalytics.social_account_id == account.id
        ).first()

        if existing:
            existing.followers = stats["followers"]
            existing.last_synced = datetime.now(timezone.utc)
        else:
            db.add(AudienceAnalytics(
                social_account_id=account.id,
                platform="linkedin",
                followers=stats["followers"],
                new_followers=0,
                lost_followers=0,
                last_synced=datetime.now(timezone.utc),
            ))
        db.commit()
    except Exception as e:
        print(f"LinkedIn audience sync failed for account {account.id}: {e}")
