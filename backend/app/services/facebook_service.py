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
            "pages_read_user_content",
            "pages_manage_posts",
            "business_management",
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
        "state": "socialpilot",
    }
 
    response = requests.get(url, params=params, timeout=30)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()

def get_long_lived_access_token(short_lived_token: str):
    """Exchange short-lived token for long-lived token (60 days)"""
    url = "https://graph.facebook.com/v23.0/oauth/access_token"
    params = {
        "grant_type": "fb_exchange_token",
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "client_secret": settings.FACEBOOK_CLIENT_SECRET,
        "fb_exchange_token": short_lived_token,
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    return response.json()


def get_facebook_user_info(access_token: str):
    """Get user's Facebook pages and profile info"""
    # Get user's pages
    url = "https://graph.facebook.com/v23.0/me/accounts"

    params = {
        "access_token": access_token,
        "fields": "id,name,username,fan_count,picture{url},access_token",
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        raise Exception(response.json())
    
    data = response.json()


    print("\n========= Facebook User Info =========")
    print(data)
    print("=======================================\n")

    pages = data.get("data", [])

    if not pages:
        raise Exception("No Facebook pages found.")
    # Return the first page (in production, let user choose)

    page = pages[0]
    return {
        "platform_user_id": page["id"],
        "username": page.get("username", page["name"]),
        "followers_count": page.get("fan_count", 0),
        "profile_image": page.get("picture", {}).get("data", {}).get("url"),
        "page_access_token": page.get("access_token"),
    }

def get_user_pages(access_token: str):
    url = "https://graph.facebook.com/v23.0/me/accounts"

    params = {
        "access_token": access_token
    }

    response = requests.get(url, params=params)

    data = response.json()

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

    response = requests.post(url, data=payload,timeout=30)

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
        "caption": caption,
        "access_token": page_access_token,
    }

    response = requests.post(url, data=payload)

    if response.status_code != 200:
        raise Exception(response.json())

    return response.json()


def upload_facebook_video(
    page_id: str,
    page_access_token: str,
    video_url: str,
    description: str,
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

# def publish_post(post, account) -> dict:
#     """
#     Entry point called by dispatch_publish in publishing_service.py.
#     Uses Page ID (platform_user_id) and Page Access Token (access_token)
#     stored during Facebook OAuth callback.
#     """
#     print("🔥 FACEBOOK publish_post() CALLED")
#     print("Post ID:", post.id)
#     print("Account ID:", account.id)
#     print("Page ID:", account.platform_user_id)
#     print("Has access token:", bool(account.access_token))

#     try:
#         page_id = account.platform_user_id
#         page_access_token = account.access_token

#         if not page_id or not page_access_token:
#             return {
#                 "success": False,
#                 "failure_reason": "Missing Facebook Page ID or access token.",
#                 "raw_response": {},
#             }

#         # Text post
#         if post.content_type == "text" or not post.media_file_path:
#             result = create_facebook_post(
#                 page_id=page_id,
#                 page_access_token=page_access_token,
#                 message=post.caption or "",
#             )

#         # Image post
#         elif post.content_type == "image":
#             result = upload_facebook_photo(
#                 page_id=page_id,
#                 page_access_token=page_access_token,
#                 image_url=post.media_file_path,
#                 caption=post.caption or "",
#             )

#         # Video post
#         elif post.content_type == "video":
#             result = upload_facebook_video(
#                 page_id=page_id,
#                 page_access_token=page_access_token,
#                 video_url=post.media_file_path,
#                 description=post.caption or "",
#             )
#         else:
#             result = create_facebook_post(
#                 page_id=page_id,
#                 page_access_token=page_access_token,
#                 message=post.caption or "",
#             )

#         post_id = result.get("id") or result.get("post_id")
#         return {
#             "success": True,
#             "platform_post_id": post_id,
#             "raw_response": result,
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "failure_reason": str(e),
#             "raw_response": {},
#         }


def publish_post(post, account) -> dict:
    print("🔥 FACEBOOK SERVICE FILE:", __file__)
    print("🔥 FACEBOOK publish_post() CALLED")
    print("Post ID:", post.id)
    print("Account ID:", account.id)
    print("Page ID:", account.platform_user_id)
    print("Has access token:", bool(account.access_token))

    try:
        page_id = account.platform_user_id
        print("DEBUG 1 — page_id:", page_id)

        page_access_token = account.access_token
        print("DEBUG 2 — token exists:", bool(page_access_token))

        if not page_id or not page_access_token:
            print("DEBUG 3 — EARLY RETURN: missing page_id or token")
            return {
                "success": False,
                "failure_reason": "Missing Facebook Page ID or access token.",
                "raw_response": {},
            }

        print("DEBUG 4 — about to read content_type")
        content_type = post.content_type  # ← likely crashes HERE
        print("DEBUG 5 — content_type:", content_type)

        media_path = post.media_file_path
        print("DEBUG 6 — media_path:", media_path)

        print("DEBUG 7 — entering text branch check")
        if content_type == "text" or not media_path:
            print("DEBUG 8 — ABOUT TO CALL create_facebook_post()")
            result = create_facebook_post(
                page_id=page_id,
                page_access_token=page_access_token,
                message=post.caption or "",
            )
            print("DEBUG 9 — Facebook result:", result)
        elif content_type == "image":
            result = upload_facebook_photo(
                page_id=page_id,
                page_access_token=page_access_token,
                image_url=media_path,
                caption=post.caption or "",
            )
        elif content_type == "video":
            result = upload_facebook_video(
                page_id=page_id,
                page_access_token=page_access_token,
                video_url=media_path,
                description=post.caption or "",
            )
        else:
            result = create_facebook_post(
                page_id=page_id,
                page_access_token=page_access_token,
                message=post.caption or "",
            )

        post_id = result.get("id") or result.get("post_id")
        print("DEBUG 10 — platform_post_id:", post_id)
        return {
            "success": True,
            "platform_post_id": post_id,
            "raw_response": result,
        }

    except Exception as e:
        print("🔥 FACEBOOK PUBLISH ERROR:", repr(e))
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "failure_reason": str(e),
            "raw_response": {},
        }