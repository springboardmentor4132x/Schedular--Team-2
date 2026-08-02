from fastapi import APIRouter, UploadFile, File

from app.schemas.post import CreatePostRequest

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
    get_queue_status
)

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

# Retrieve all posts
@router.get("/")
def get_posts():
    return get_all_posts()


# Create a new post
@router.post("/")
def create_new_post(post: CreatePostRequest):
    return create_post(post)


# Upload media
@router.post("/upload-media")
def upload_post_media(file: UploadFile = File(...)):
    return upload_media(file)


# Save a draft
@router.post("/save-draft")
def save_post_draft(post: CreatePostRequest):
    return save_draft(post)


# Generate a preview
@router.post("/preview")
def preview_post(post: CreatePostRequest):
    return generate_preview(post)


# Retrieve scheduled posts
@router.get("/scheduled")
def retrieve_scheduled_posts():
    return get_scheduled_posts()


# View publishing calendar
@router.get("/calendar")
def publishing_calendar():
    return get_publishing_calendar()


# View publishing queue
@router.get("/queue")
def publishing_queue():
    return get_publishing_queue()

@router.get("/queue/status")
def queue_status():
    return get_queue_status()


@router.post("/publish/{post_id}")
def publish_scheduled_post(post_id: int):
    return publish_post(post_id)


# Create a recurring schedule
@router.post("/recurring")
def recurring_schedule(post: CreatePostRequest):
    return create_recurring_schedule(post)


@router.post("/retry/{post_id}/{retry_count}")
def retry_post(post_id: int, retry_count: int):
    return retry_failed_post(post_id, retry_count)

# Retrieve a single post
@router.get("/{post_id}")
def get_post(post_id: int):
    return get_post_by_id(post_id)

# Update a post
@router.put("/{post_id}")
def update_existing_post(post_id: int):
    return update_post(post_id)

# Delete a post
@router.delete("/{post_id}")
def delete_existing_post(post_id: int):
    return delete_post(post_id)



