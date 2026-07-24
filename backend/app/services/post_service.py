from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.post import Post
from app.models.social_account import SocialAccount

MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB

def _assign_social_accounts(db: Session, post_obj: Post, social_account_ids: list[int], user_id: int):
    """Helper to safely fetch and assign social accounts belonging to the user."""
    if not social_account_ids:
        post_obj.social_accounts = []
        return
        
    accounts = db.query(SocialAccount).filter(
        SocialAccount.id.in_(social_account_ids),
        SocialAccount.user_id == user_id
    ).all()
    
    if len(accounts) != len(social_account_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more social accounts are invalid or do not belong to you."
        )
    
    post_obj.social_accounts = accounts


def create_post(db: Session, post_data, user_id: int):
    """Create a new post."""
    data = post_data.model_dump(exclude={"social_account_ids"})
    new_post = Post(user_id=user_id, **data)
    
    if post_data.social_account_ids is not None:
        _assign_social_accounts(db, new_post, post_data.social_account_ids, user_id)
        
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


def get_all_posts(db: Session, user_id: int):
    return db.query(Post).filter(Post.user_id == user_id).all()


def get_post_by_id(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


def update_post(db: Session, post_id: int, post_update, user_id: int):
    db_post = get_post_by_id(db, post_id, user_id)
    
    update_data = post_update.model_dump(exclude_unset=True, exclude={"social_account_ids"})
    for key, value in update_data.items():
        setattr(db_post, key, value)
        
    if post_update.social_account_ids is not None:
        _assign_social_accounts(db, db_post, post_update.social_account_ids, user_id)
        
    db.commit()
    db.refresh(db_post)
    return db_post


def delete_post(db: Session, post_id: int, user_id: int):
    db_post = get_post_by_id(db, post_id, user_id)
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted successfully"}


def save_draft(db: Session, post_data, user_id: int):
    """Create a post and explicitly set status to Draft."""
    data = post_data.model_dump(exclude={"social_account_ids"})
    data["status"] = "Draft"
    new_post = Post(user_id=user_id, **data)
    
    if post_data.social_account_ids is not None:
        _assign_social_accounts(db, new_post, post_data.social_account_ids, user_id)
        
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


def schedule_post(db: Session, post_data, user_id: int):
    """Schedule a post."""
    if not post_data.scheduled_for:
        raise HTTPException(
            status_code=400,
            detail="scheduled_for datetime is required to schedule a post."
        )
        
    # Naive vs aware datetime check
    now = datetime.now(timezone.utc)
    target = post_data.scheduled_for
    if target.tzinfo is None:
        target = target.replace(tzinfo=timezone.utc)
        
    if target <= now:
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future."
        )

    data = post_data.model_dump(exclude={"social_account_ids"})
    data["status"] = "Scheduled"
    
    new_post = Post(user_id=user_id, **data)
    
    if post_data.social_account_ids is not None:
        _assign_social_accounts(db, new_post, post_data.social_account_ids, user_id)
        
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


def get_scheduled_posts(db: Session, user_id: int):
    return db.query(Post).filter(
        Post.user_id == user_id, 
        Post.status == "Scheduled"
    ).all()


def upload_media(file: UploadFile):
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "video/mp4"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and MP4 files are allowed."
        )

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


def generate_preview(post_data):
    return {
        "message": "Preview generated successfully",
        "preview": post_data.model_dump()
    }


def get_publishing_calendar(db: Session, user_id: int):
    return {
        "message": "Publishing calendar retrieved successfully"
    }

def get_publishing_queue(db: Session, user_id: int):
    return {
        "message": "Publishing queue retrieved successfully"
    }