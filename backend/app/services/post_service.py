from fastapi import UploadFile, HTTPException
from datetime import datetime

MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB
def create_post(post):
    """Create a new post."""

    if post.scheduled_time is not None:
        if post.scheduled_time <= datetime.now():
            raise HTTPException(
                status_code=400,
                detail="Scheduled time must be in the future."
            )

    return {
        "message": "Post created successfully",
        "data": post
    }


def get_all_posts():
    return {
        "message": "Get All Posts - Pending Database Integration"
    }


def get_post_by_id(post_id: int):
    return {
        "message": f"Get Post {post_id} - Pending Database Integration"
    }


def update_post(post_id: int):
    return {
        "message": f"Update Post {post_id} - Pending Database Integration"
    }


def delete_post(post_id: int):
    return {
        "message": f"Delete Post {post_id} - Pending Database Integration"
    }


def upload_media(file: UploadFile):

    

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4"
    ]

    # File Type Validation
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and MP4 files are allowed."
        )

    # File Size Validation
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size should not exceed 10 MB."
        )

    return {
        "message": "Media uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "status": "Uploaded"
    }

def save_draft(post):
    return {
        "message": "Draft saved successfully",
        "status": "Draft",
        "data": post
    }


def get_scheduled_posts():
    return {
        "message": "Scheduled posts retrieved successfully"
    }


def generate_preview(post):
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
    return {
        "message": "Publishing calendar retrieved successfully"
    }
def get_publishing_queue():
    return {
        "message": "Publishing queue retrieved successfully"
    }