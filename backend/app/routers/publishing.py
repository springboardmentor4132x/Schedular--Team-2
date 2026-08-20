from datetime import datetime, timezone as dt_timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.dependencies import get_current_user, verify_workspace_access
from app.models.user import User
from app.models.post import Post
from app.models.publishing_queue import PublishingQueue
from app.models.publishing_log import PublishingLog

from app.schemas.publishing_queue import (
    PublishingQueueResponse,
    PublishingQueueItemResponse,
    QueueRescheduleRequest,
    QueueActionResponse,
)
from app.schemas.publishing_log import PublishingLogResponse, PublishingLogItemResponse
from app.schemas.publishing_dashboard import (
    PublishingDashboardResponse,
    PublishingDashboardSummary,
    PublishingDashboardPost,
    FailedPostOut,
    RetryResponse,
    PlatformHistoryItem,
)

from app.services import publishing_service

router = APIRouter(prefix="/publishing", tags=["Publishing"])


def _post_platforms(post: Post) -> List[str]:
    return [acc.platform for acc in post.social_accounts]


def _posts_in_scope(query, user_id: int, workspace_id: Optional[int]):
    query = query.filter(Post.user_id == user_id)
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    return query


# ---------------------------------------------------------
# 1. Publishing Dashboard
# ---------------------------------------------------------

@router.get("/dashboard", response_model=PublishingDashboardResponse)
def get_dashboard(
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = db.query(Post)
    query = _posts_in_scope(query, current_user.id, workspace_id)
    posts = query.all()

    summary = PublishingDashboardSummary(
        total_scheduled=sum(1 for p in posts if p.status == "Scheduled"),
        total_published=sum(1 for p in posts if p.status == "Published"),
        total_queued=sum(1 for p in posts if p.status == "Queued"),
        total_failed=sum(1 for p in posts if p.status == "Failed"),
    )

    post_items = [
        PublishingDashboardPost(
            **PublishingDashboardPost.model_validate(p, from_attributes=True).model_dump(
                exclude={"platforms"}
            ),
            platforms=_post_platforms(p),
        )
        for p in posts
    ]

    return PublishingDashboardResponse(summary=summary, posts=post_items)


# ---------------------------------------------------------
# 2. Publishing Queue
# ---------------------------------------------------------

@router.get("/queue", response_model=List[PublishingQueueItemResponse])
def get_queue(
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = (
        db.query(PublishingQueue)
        .join(Post, Post.id == PublishingQueue.post_id)
        .filter(Post.user_id == current_user.id)
    )
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    # Queue display order: active entries (Pending / Processing / Paused) first
    # by soonest scheduled time, then historical entries (Failed / Completed /
    # Cancelled) — everything time-sorted rather than priority-first.
    status_order = case(
        {"Pending": 0, "Processing": 1, "Paused": 2, "Failed": 3, "Completed": 4, "Cancelled": 5},
        value=PublishingQueue.processing_status,
        else_=5,
    )
    entries = query.order_by(
        status_order,
        PublishingQueue.scheduled_time.asc(),
    ).all()

    items = []
    for entry in entries:
        post = entry.post
        items.append(
            PublishingQueueItemResponse(
                id=entry.id,
                post_id=entry.post_id,
                title=post.title,
                caption=post.caption,
                platforms=_post_platforms(post),
                campaign_name=post.campaign.name if post.campaign else None,
                scheduled_time=entry.scheduled_time,
                execution_priority=entry.execution_priority,
                processing_status=entry.processing_status,
                retry_count=entry.retry_count,
                max_retries=entry.max_retries,
                created_at=entry.created_at,
                updated_at=entry.updated_at,
            )
        )
    return items


@router.patch("/queue/{queue_id}/reschedule", response_model=QueueActionResponse)
def reschedule_queue_entry(
    queue_id: int,
    payload: QueueRescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_owned_queue_entry(db, queue_id, current_user.id)
    updated = publishing_service.reschedule_entry(db, entry.id, payload.scheduled_time)
    return QueueActionResponse(
        message="Post rescheduled successfully.",
        queue_id=updated.id,
        processing_status=updated.processing_status,
    )


@router.patch("/queue/{queue_id}/cancel", response_model=QueueActionResponse)
def cancel_queue_entry(
    queue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_owned_queue_entry(db, queue_id, current_user.id)
    updated = publishing_service.cancel_entry(db, entry.id)
    return QueueActionResponse(
        message="Scheduled publishing cancelled.",
        queue_id=updated.id,
        processing_status=updated.processing_status,
    )


@router.patch("/queue/{queue_id}/pause", response_model=QueueActionResponse)
def pause_queue_entry(
    queue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_owned_queue_entry(db, queue_id, current_user.id)
    updated = publishing_service.pause_entry(db, entry.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Only pending entries can be paused.")
    return QueueActionResponse(
        message="Scheduled publishing paused.",
        queue_id=updated.id,
        processing_status=updated.processing_status,
    )


@router.patch("/queue/{queue_id}/resume", response_model=QueueActionResponse)
def resume_queue_entry(
    queue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_owned_queue_entry(db, queue_id, current_user.id)
    updated = publishing_service.resume_entry(db, entry.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Only paused entries can be resumed.")
    return QueueActionResponse(
        message="Scheduled publishing resumed.",
        queue_id=updated.id,
        processing_status=updated.processing_status,
    )


def _get_owned_queue_entry(db: Session, queue_id: int, user_id: int) -> PublishingQueue:
    entry = (
        db.query(PublishingQueue)
        .join(Post, Post.id == PublishingQueue.post_id)
        .filter(PublishingQueue.id == queue_id, Post.user_id == user_id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found.")
    return entry


# ---------------------------------------------------------
# 3. Publishing Logs
# ---------------------------------------------------------

@router.get("/logs", response_model=List[PublishingLogItemResponse])
def get_logs(
    platform: str | None = None,
    status: str | None = None,
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = (
        db.query(PublishingLog)
        .join(Post, Post.id == PublishingLog.post_id)
        .filter(Post.user_id == current_user.id)
    )
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    if platform:
        query = query.filter(PublishingLog.platform == platform)
    if status:
        query = query.filter(PublishingLog.status == status)

    rows = query.order_by(PublishingLog.created_at.desc()).all()

    items = []
    for log in rows:
        post = log.post
        items.append(
            PublishingLogItemResponse(
                id=log.id,
                post_id=log.post_id,
                title=post.title,
                caption=post.caption,
                platforms=_post_platforms(post),
                campaign_name=post.campaign.name if post.campaign else None,
                platform=log.platform,
                status=log.status,
                response=log.response,
                retry_count=log.retry_count,
                created_at=log.created_at,
                published_by=(post.user.first_name + " " + post.user.last_name).strip() or post.user.username,
            )
        )
    return items


# ---------------------------------------------------------
# 4. Failed Posts
# ---------------------------------------------------------

@router.get("/failed", response_model=List[FailedPostOut])
def get_failed_posts(
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = db.query(Post).filter(Post.user_id == current_user.id, Post.status == "Failed")
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    posts = query.all()
    return [
        FailedPostOut(
            **FailedPostOut.model_validate(p, from_attributes=True).model_dump(
                exclude={"platforms"}
            ),
            platforms=_post_platforms(p),
        )
        for p in posts
    ]


@router.post("/failed/{post_id}/retry", response_model=RetryResponse)
def retry_failed_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.status != "Failed":
        raise HTTPException(status_code=400, detail="Only failed posts can be retried.")

    updated = publishing_service.retry_failed_post(db, post_id)
    return RetryResponse(message="Post re-queued for publishing.", post_id=updated.id, status=updated.status)


# ---------------------------------------------------------
# 5. Platform Publishing History
# ---------------------------------------------------------

@router.get("/history/{platform}", response_model=List[PlatformHistoryItem])
def get_platform_history(
    platform: str,
    workspace_id: Optional[int] = Query(None, description="Scope to a workspace (business/marketing)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.status.in_(["Published", "Failed"]),
    )
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    posts = query.all()

    items = []
    for post in posts:
        platforms = _post_platforms(post)
        if platform not in platforms:
            continue
        items.append(
            PlatformHistoryItem(
                post_id=post.id,
                platform=platform,
                published_at=post.published_at,
                status=post.status,
                platform_post_id=post.platform_post_id,
                api_response=post.api_response,
            )
        )
    return items


# ---------------------------------------------------------
# 9. Monitoring
# ---------------------------------------------------------

@router.get("/monitor")
def monitor_publishing_service(db: Session = Depends(get_db)):
    pending = db.query(PublishingQueue).filter(PublishingQueue.processing_status == "Pending").count()
    processing = db.query(PublishingQueue).filter(PublishingQueue.processing_status == "Processing").count()
    return {
        "status": "running",
        "pending_in_queue": pending,
        "currently_processing": processing,
        "checked_at": datetime.now(dt_timezone.utc).isoformat(),
    }