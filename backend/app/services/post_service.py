from fastapi import UploadFile, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.post import Post

MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB
def create_post(post, db: Session, current_user):
    """Create a new post."""

    if post.scheduled_time is not None:
        if post.scheduled_time <= datetime.now():
            raise HTTPException(
                status_code=400,
                detail="Scheduled time must be in the future."
            )

        existing_post = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.scheduled_for == post.scheduled_time
        ).first()

        if existing_post:
            raise HTTPException(
                status_code=400,
                detail="You already have a post scheduled at this time."
            )

    new_post = Post(
        user_id=current_user.id,
        title=post.title,
        caption=post.caption,
        media_file_path=post.media_url,
        scheduled_for=post.scheduled_time
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "message": "Post created successfully",
        "post_id": new_post.id
    }
def get_all_posts(db: Session):
    print("GET POSTS CALLED")

    posts = db.query(Post).all()

    print(posts)

    return posts


def get_post_by_id(post_id: int, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return post

def update_post(post_id: int, post_data, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    post.title = post_data.title
    post.caption = post_data.caption
    post.media_file_path = post_data.media_url
    post.scheduled_for = post_data.scheduled_time

    db.commit()
    db.refresh(post)

    return {
        "message": "Post updated successfully",
        "post": post
    }

def delete_post(post_id: int, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    db.delete(post)
    db.commit()

    return {
        "message": "Post deleted successfully"
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