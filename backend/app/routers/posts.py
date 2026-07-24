from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.post import CreatePostRequest
from app.services.post_service import (
    create_post,
    get_all_posts,
    get_post_by_id,
    update_post,
    delete_post,
    upload_media,
    save_draft,
    get_scheduled_posts,
    generate_preview,
    get_publishing_calendar,
    get_publishing_queue
)

router = APIRouter(
    prefix="/posts", 
    tags=["Posts"]
    )

@router.post("/schedule")
def schedule_post(
    post: CreatePostRequest,
    current_user: User = Depends(get_current_user)
):
    """Schedules a new post (Saves metadata in Postgres, content in Mongo)."""
    return {"message": "Pending Implementation (Anwin)"}
@router.get("/")
def get_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
  return get_all_posts(db)


@router.post("/")
def create_new_post(
    post: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_post(post, db, current_user)

@router.post("/upload-media")
def upload_post_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    return upload_media(file)

@router.post("/save-draft")
def save_post_draft(
    post: CreatePostRequest,
    current_user: User = Depends(get_current_user)
):
    return save_draft(post)

@router.post("/preview")
def preview_post(
    post: CreatePostRequest,
    current_user: User = Depends(get_current_user)
):
    return generate_preview(post)
@router.get("/scheduled")
def retrieve_scheduled_posts(
    current_user: User = Depends(get_current_user)
):
    return get_scheduled_posts()

@router.get("/calendar")
def publishing_calendar(
    current_user: User = Depends(get_current_user)
):
    return get_publishing_calendar()
@router.get("/queue")
def publishing_queue(
    current_user: User = Depends(get_current_user)
):
    return get_publishing_queue()

@router.get("/{post_id}")
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_post_by_id(post_id, db)

@router.put("/{post_id}")
def update_existing_post(
    post_id: int,
    post: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_post(post_id, post, db)

@router.delete("/{post_id}")
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_post(post_id, db)
