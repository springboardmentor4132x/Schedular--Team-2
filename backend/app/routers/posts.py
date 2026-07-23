from fastapi import APIRouter, UploadFile, File
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
def schedule_post(post: CreatePostRequest):
    """Schedules a new post (Saves metadata in Postgres, content in Mongo)."""
    return {"message": "Pending Implementation (Anwin)"}

@router.get("/")
def get_posts():
    return get_all_posts()

@router.post("/")
def create_new_post(post: CreatePostRequest):
    return create_post(post)

@router.post("/upload-media")
def upload_post_media(file: UploadFile = File(...)):
    return upload_media(file)

@router.post("/save-draft")
def save_post_draft(post: CreatePostRequest):
    return save_draft(post)

@router.post("/preview")
def preview_post(post: CreatePostRequest):
    return generate_preview(post)

@router.get("/scheduled")
def retrieve_scheduled_posts():
    return get_scheduled_posts()

@router.get("/calendar")
def publishing_calendar():
    return get_publishing_calendar()

@router.get("/queue")
def publishing_queue():
    return get_publishing_queue()

@router.get("/{post_id}")
def get_post(post_id: int):
    return get_post_by_id(post_id)

@router.put("/{post_id}")
def update_existing_post(post_id: int):
    return update_post(post_id)

@router.delete("/{post_id}")
def delete_existing_post(post_id: int):
    return delete_post(post_id)
