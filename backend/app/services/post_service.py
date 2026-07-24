from fastapi import UploadFile,HTTPException
from datetime import datetime, timezone

def create_post(post):
    """Create a new post."""

    if post.scheduled_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future."
        )

    return {
        "message": "Post created successfully",
        "data": post
    }


def get_all_posts():
    """Get all posts."""
    return {
        "message": "Get All Posts - Pending Database Integration"
    }


def get_post_by_id(post_id: int):
    """Get a post by ID."""
    return {
        "message": f"Get Post {post_id} - Pending Database Integration"
    }


def update_post(post_id: int):
    """Update post details."""
    return {
        "message": f"Update Post {post_id} - Pending Database Integration"
    }


def delete_post(post_id: int):
    """Delete a post."""
    return {
        "message": f"Delete Post {post_id} - Pending Database Integration"
    }


def upload_media(file: UploadFile):
    """Upload media."""

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and MP4 files are allowed."
        )

    return {
        "message": "Media uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "status": "Uploaded"
    }


def save_draft(post):
    """Save post as draft."""
    return {
        "message": "Draft saved successfully",
        "status": "Draft",
        "data": post
    }


def get_scheduled_posts():
    """Retrieve scheduled posts."""
    return {
        "message": "Scheduled posts retrieved successfully",
        "posts": [
            {
                "id": 1,
                "title": "Instagram Post",
                "scheduled_time": "2026-07-22T10:00:00"
            },
            {
                "id": 2,
                "title": "Facebook Campaign",
                "scheduled_time": "2026-07-23T12:00:00"
            }
        ]
    }

def generate_preview(post):
    """Generate a preview of the post before publishing."""
    return {
        "message": "Preview generated successfully",
        "preview": {
            "title": post.title,
            "caption": post.caption,
            "media_url": post.media_url,
            "scheduled_time": post.scheduled_time,
            "social_accounts": post.social_accounts
        }
    }

def get_publishing_calendar():
    """Retrieve publishing calendar."""
    return {
        "message": "Publishing calendar retrieved successfully",
        "calendar": [
            {
                "date": "2026-07-25",
                "posts": [
                    {
                        "id": 1,
                        "title": "Instagram Post",
                        "time": "10:00:00",
                        "status": "Scheduled"
                    }
                ]
            },
            {
                "date": "2026-07-26",
                "posts": [
                    {
                        "id": 2,
                        "title": "Facebook Campaign",
                        "time": "02:30:00",
                        "status": "Scheduled"
                    }
                ]
            }
        ]
    }


def get_publishing_queue():
    """Retrieve publishing queue."""
    return {
        "message": "Publishing queue retrieved successfully",
        "queue": [
            {
                "id": 1,
                "title": "Instagram Post",
                "platform": "Instagram",
                "scheduled_time": "2026-07-25T10:00:00",
                "status": "Pending"
            },
            {
                "id": 2,
                "title": "Facebook Campaign",
                "platform": "Facebook",
                "scheduled_time": "2026-07-25T12:30:00",
                "status": "Scheduled"
            },
            {
                "id": 3,
                "title": "LinkedIn Update",
                "platform": "LinkedIn",
                "scheduled_time": "2026-07-25T03:00:00",
                "status": "Published"
            }
        ]
    }
