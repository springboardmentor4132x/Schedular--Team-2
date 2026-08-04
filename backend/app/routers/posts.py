from typing import List

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.post import (
    PostCreate,
    PostResponse,
    PostUpdate,
)

from app.services import post_service

from app.services.post_service import (
    create_post,
    get_all_posts,
    get_post_by_id,
    retry_failed_post,
    update_post,
    delete_post,
    upload_media,
    save_draft,
    get_scheduled_posts,
    generate_preview,
    get_publishing_calendar,
    get_publishing_queue,
    publish_post,
    create_recurring_schedule,
)

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.post("/schedule", response_model=PostResponse)
def schedule_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedules a new post (stores scheduling info in Postgres)."""
    return post_service.create_post(
        db,
        current_user.id,
        post,
        status="Scheduled",
    )


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
    return post_service.create_post(
        db,
        current_user.id,
        post,
        status=post.status or "Scheduled",
    )


# Upload media
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

# Generate a preview
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

# View publishing calendar
@router.get("/calendar")
def publishing_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_publishing_calendar(db, current_user.id)

# View publishing queue
@router.get("/queue")
def publishing_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_publishing_queue(db, current_user.id)


@router.post("/publish/{post_id}")
def publish_scheduled_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.publish_post(
        db,
        current_user.id,
        post_id,
    )


@router.post("/recurring")
def recurring_schedule(post: PostCreate):
    return create_recurring_schedule(post)


@router.post("/retry/{post_id}/{retry_count}")
def retry_post(post_id: int, retry_count: int):
    return retry_failed_post(post_id, retry_count)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.get_post_by_id(
        db,
        current_user.id,
        post_id,
    )


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.update_post(
        db,
        current_user.id,
        post_id,
        post,
    )

# Delete a post
@router.delete("/{post_id}")
def delete_existing_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return post_service.delete_post(
        db,
        current_user.id,
        post_id,
    )