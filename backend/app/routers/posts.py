from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.services.post_service import (
    create_post,
    get_all_posts,
    get_post_by_id,
    update_post,
    delete_post,
    upload_media,
    save_draft,
    schedule_post,
    get_scheduled_posts,
    generate_preview,
    get_publishing_calendar,
    get_publishing_queue
)

router = APIRouter(
    prefix="/posts", 
    tags=["Posts"]
)

@router.get("/", response_model=List[PostResponse])
def get_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_posts(db, current_user.id)


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_post(db, post, current_user.id)


@router.post("/schedule", response_model=PostResponse)
def schedule_new_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedules a new post."""
    return schedule_post(db, post, current_user.id)


@router.post("/save-draft", response_model=PostResponse)
def save_post_draft(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return save_draft(db, post, current_user.id)


@router.get("/scheduled", response_model=List[PostResponse])
def retrieve_scheduled_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_scheduled_posts(db, current_user.id)


@router.get("/calendar")
def publishing_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_publishing_calendar(db, current_user.id)


@router.get("/queue")
def publishing_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_publishing_queue(db, current_user.id)


@router.post("/upload-media")
def upload_post_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    return upload_media(file)


@router.post("/preview")
def preview_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user)
):
    return generate_preview(post)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_post_by_id(db, post_id, current_user.id)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_post(db, post_id, post_update, current_user.id)


@router.delete("/{post_id}")
def delete_existing_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_post(db, post_id, current_user.id)
