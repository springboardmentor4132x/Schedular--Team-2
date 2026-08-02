import os
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.schemas.post import PostCreate, PostUpdate

ALLOWED_MEDIA_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "video/mp4",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

PUBLISHING_STATUSES = ("Scheduled", "Queued")


def _now():
    return datetime.now(timezone.utc)


def _to_aware(dt: datetime) -> datetime:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _get_owned_accounts(db: Session, user_id: int, account_ids: list[int]):
    if not account_ids:
        return []
    return (
        db.query(SocialAccount)
        .filter(
            SocialAccount.id.in_(account_ids),
            SocialAccount.user_id == user_id,
        )
        .all()
    )


def _post_response(post: Post):
    data = {
        "id": post.id,
        "user_id": post.user_id,
        "workspace_id": post.workspace_id,
        "campaign_id": post.campaign_id,
        "title": post.title,
        "caption": post.caption,
        "content_type": post.content_type,
        "media_file_path": post.media_file_path,
        "status": post.status,
        "scheduled_for": post.scheduled_for,
        "timezone": post.timezone,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "social_account_ids": [acc.id for acc in post.social_accounts],
    }
    return data


def create_post(db: Session, user_id: int, post: PostCreate, status: str = "Scheduled", account_ids: list[int] | None = None):
    """Create a new post and schedule it for publication."""

    scheduled_for = _to_aware(post.scheduled_for)
    if scheduled_for is not None and scheduled_for <= _now():
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future.",
        )

    new_post = Post(
        user_id=user_id,
        workspace_id=post.workspace_id,
        campaign_id=post.campaign_id,
        title=post.title,
        caption=post.caption,
        content_type=post.content_type or "text",
        media_file_path=post.media_url,
        status=status,
        scheduled_for=scheduled_for,
        timezone=post.timezone or "UTC",
    )

    db.add(new_post)
    db.flush()

    if account_ids is not None:
        new_post.social_accounts = db.query(SocialAccount).filter(SocialAccount.id.in_(account_ids)).all()
    else:
        new_post.social_accounts = _get_owned_accounts(db, user_id, post.social_account_ids)

    db.commit()
    db.refresh(new_post)
    return _post_response(new_post)


def save_draft(db: Session, user_id: int, post: PostCreate, account_ids: list[int] | None = None):
    """Save a post as a draft (no future-time requirement)."""
    new_post = Post(
        user_id=user_id,
        workspace_id=post.workspace_id,
        campaign_id=post.campaign_id,
        title=post.title,
        caption=post.caption,
        content_type=post.content_type or "text",
        media_file_path=post.media_url,
        status="Draft",
        scheduled_for=_to_aware(post.scheduled_for),
        timezone=post.timezone or "UTC",
    )

    db.add(new_post)
    db.flush()

    if account_ids is not None:
        new_post.social_accounts = db.query(SocialAccount).filter(SocialAccount.id.in_(account_ids)).all()
    else:
        new_post.social_accounts = _get_owned_accounts(db, user_id, post.social_account_ids)

    db.commit()
    db.refresh(new_post)
    return _post_response(new_post)


def get_all_posts(db: Session, user_id: int):
    posts = (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.created_at.desc())
        .all()
    )
    return [_post_response(p) for p in posts]


def get_post_by_id(db: Session, user_id: int, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this post")
    return _post_response(post)


def update_post(db: Session, user_id: int, post_id: int, post_data: PostUpdate):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    if post_data.scheduled_for is not None:
        scheduled_for = _to_aware(post_data.scheduled_for)
        if scheduled_for <= _now():
            raise HTTPException(
                status_code=400,
                detail="Scheduled time must be in the future.",
            )
        post.scheduled_for = scheduled_for

    fields = {
        "title": post_data.title,
        "caption": post_data.caption,
        "content_type": post_data.content_type,
        "media_file_path": post_data.media_url,
        "timezone": post_data.timezone,
        "campaign_id": post_data.campaign_id,
        "workspace_id": post_data.workspace_id,
        "status": post_data.status,
    }
    for field, value in fields.items():
        if value is not None:
            setattr(post, field, value)

    if post_data.social_account_ids is not None:
        post.social_accounts = _get_owned_accounts(db, user_id, post_data.social_account_ids)

    db.commit()
    db.refresh(post)
    return _post_response(post)


def delete_post(db: Session, user_id: int, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}


def upload_media(file: UploadFile):
    if file.content_type not in ALLOWED_MEDIA_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, GIF, WEBP and MP4 files are allowed.",
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size should not exceed 10 MB.",
        )

    os.makedirs(settings.MEDIA_DIR, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1].lower()
    if not extension:
        extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "video/mp4": ".mp4",
        }.get(file.content_type, "")

    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(settings.MEDIA_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    media_url = f"/uploads/{filename}"

    return {
        "message": "Media uploaded successfully",
        "filename": filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "media_url": media_url,
        "status": "Uploaded",
    }


def get_scheduled_posts(db: Session, user_id: int):
    posts = (
        db.query(Post)
        .filter(
            Post.user_id == user_id,
            Post.status.in_(PUBLISHING_STATUSES),
        )
        .order_by(Post.scheduled_for.asc())
        .all()
    )
    return [_post_response(p) for p in posts]


def generate_preview(post_data):
    return {
        "message": "Preview generated successfully",
        "preview": {
            "title": post_data.title,
            "caption": post_data.caption,
            "media_url": post_data.media_url,
            "scheduled_for": post_data.scheduled_for,
            "timezone": post_data.timezone,
            "social_account_ids": post_data.social_account_ids,
        },
    }


def get_publishing_calendar(db: Session, user_id: int):
    posts = get_scheduled_posts(db, user_id)
    calendar = {}
    for post in posts:
        key = post["scheduled_for"].date().isoformat() if post["scheduled_for"] else "unscheduled"
        calendar.setdefault(key, []).append(post)
    return {
        "message": "Publishing calendar retrieved successfully",
        "calendar": calendar,
    }


def get_publishing_queue(db: Session, user_id: int):
    posts = (
        db.query(Post)
        .filter(
            Post.user_id == user_id,
            Post.status.in_(("Scheduled", "Queued", "Failed")),
        )
        .order_by(Post.scheduled_for.asc())
        .all()
    )
    return {
        "message": "Publishing queue retrieved successfully",
        "queue": [_post_response(p) for p in posts],
    }
