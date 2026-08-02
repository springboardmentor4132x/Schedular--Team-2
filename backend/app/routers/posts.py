from typing import List

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("/schedule", response_model=PostResponse)
def schedule_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedules a new post (stores scheduling info in Postgres)."""
    return post_service.create_post(db, current_user.id, post, status="Scheduled")


@router.get("/", response_model=List[PostResponse])
def get_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_all_posts(db, current_user.id)


@router.post("/", response_model=PostResponse)
def create_new_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.create_post(db, current_user.id, post, status=post.status or "Scheduled")


@router.post("/upload-media")
def upload_post_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    return post_service.upload_media(file)


@router.post("/save-draft", response_model=PostResponse)
def save_post_draft(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.save_draft(db, current_user.id, post)


@router.post("/preview")
def preview_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
):
    return post_service.generate_preview(post)


@router.get("/scheduled", response_model=List[PostResponse])
def retrieve_scheduled_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_scheduled_posts(db, current_user.id)


@router.get("/calendar")
def publishing_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_publishing_calendar(db, current_user.id)


@router.get("/queue")
def publishing_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_publishing_queue(db, current_user.id)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_post_by_id(db, current_user.id, post_id)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.update_post(db, current_user.id, post_id, post)


@router.delete("/{post_id}")
def delete_existing_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.delete_post(db, current_user.id, post_id)
