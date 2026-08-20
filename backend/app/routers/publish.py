"""Module 5 — the canonical `/publish/*` API surface.

Exposes the seven endpoints required by the spec, backed by the same
services used by the `/publishing/*` routes:
    GET  /publish/ready
    POST /publish/{post_id}
    POST /publish/retry/{post_id}
    POST /publish/cancel/{post_id}
    GET  /publish/history
    GET  /publish/logs
    GET  /publish/queue
"""
from datetime import datetime, timezone as dt_timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.dependencies import get_current_user, verify_workspace_access
from app.models.user import User
from app.models.post import Post
from app.models.publishing_queue import PublishingQueue
from app.models.publishing_log import PublishingLog

from app.schemas.publishing_queue import (
    PublishingQueueItemResponse,
    QueueActionResponse,
)
from app.schemas.publishing_dashboard import (
    FailedPostOut,
    RetryResponse,
    PlatformHistoryItem,
)
from app.schemas.publishing import PublishReadyItem, PublishPublishResponse, PublishOutcome

from app.services import publishing_service

router = APIRouter(prefix="/publish", tags=["Publish"])


def _post_platforms(post: Post) -> List[str]:
    return [acc.platform for acc in post.social_accounts]


def _scope_query(query, user_id: int, workspace_id: Optional[int]):
    query = query.filter(Post.user_id == user_id)
    if workspace_id is not None:
        query = query.filter(Post.workspace_id == workspace_id)
    return query


def _get_owned_post(db: Session, post_id: int, user: User, workspace_id: Optional[int]):
    query = _scope_query(db.query(Post).filter(Post.id == post_id), user.id, workspace_id)
    post = query.first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post


# ---------------------------------------------------------
# GET /publish/ready — posts due to be published right now
# ---------------------------------------------------------

@router.get("/ready", response_model=List[PublishReadyItem])
def get_ready_posts(
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    now = datetime.now(dt_timezone.utc)
    query = db.query(Post).filter(
        Post.status.in_(["Scheduled", "Queued"]),
        Post.scheduled_for <= now,
    )
    query = _scope_query(query, current_user.id, workspace_id)
    posts = query.order_by(Post.scheduled_for.asc()).all()

    return [
        PublishReadyItem(
            id=post.id,
            title=post.title,
            caption=post.caption,
            platforms=_post_platforms(post),
            content_type=post.content_type,
            scheduled_for=post.scheduled_for,
            status=post.status,
        )
        for post in posts
    ]


# ---------------------------------------------------------
# POST /publish/{post_id} — publish a post now
# ---------------------------------------------------------

@router.post("/{post_id}", response_model=PublishPublishResponse)
def publish_post(
    post_id: int,
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = _get_owned_post(db, post_id, current_user, workspace_id)
    updated = publishing_service.publish_post_immediately(db, post_id)
    if not updated:
        raise HTTPException(
            status_code=400,
            detail="Post cannot be published from its current state.",
        )
    summary, logs = _summarize_publish(db, updated)
    if updated.status == "Published":
        message = "Post published successfully."
    else:
        message = updated.failure_reason or "Post publish failed."
    return PublishPublishResponse(
        message=message,
        post_id=updated.id,
        status=updated.status,
        summary=summary,
        logs=logs,
    )


def _summarize_publish(db: Session, post: Post):
    summary = PublishOutcome(
        published=1 if post.status == "Published" else 0,
        failed=1 if post.status == "Failed" else 0,
        total=len(post.social_accounts) or 1,
        platform_post_id=post.platform_post_id,
        failure_reason=post.failure_reason,
    )
    recent_logs = (
        db.query(PublishingLog)
        .filter(PublishingLog.post_id == post.id)
        .order_by(PublishingLog.created_at.desc())
        .limit(20)
        .all()
    )
    logs = [
        {
            "id": log.id,
            "platform": log.platform,
            "status": log.status,
            "retry_count": log.retry_count,
            "failure_reason": log.failure_reason,
            "platform_post_id": log.platform_post_id,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in recent_logs
    ]
    return summary, logs


# ---------------------------------------------------------
# POST /publish/retry/{post_id}
# ---------------------------------------------------------

@router.post("/retry/{post_id}", response_model=RetryResponse)
def retry_post(
    post_id: int,
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = _get_owned_post(db, post_id, current_user, workspace_id)
    if post.status != "Failed":
        raise HTTPException(status_code=400, detail="Only failed posts can be retried.")
    publishing_service.retry_failed_post(db, post_id)
    updated = publishing_service.publish_post_immediately(db, post_id)
    if updated and updated.status == "Published":
        return RetryResponse(
            message="Post retried and published successfully.",
            post_id=updated.id,
            status=updated.status,
        )
    return RetryResponse(
        message=(updated.failure_reason if updated else "Post requeued for retry."),
        post_id=post_id,
        status=updated.status if updated else "Scheduled",
    )


# ---------------------------------------------------------
# POST /publish/cancel/{post_id}
# ---------------------------------------------------------

@router.post("/cancel/{post_id}", response_model=QueueActionResponse)
def cancel_post(
    post_id: int,
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = _get_owned_post(db, post_id, current_user, workspace_id)
    updated = publishing_service.cancel_post(db, post_id)
    if not updated or updated.status != "Cancelled":
        raise HTTPException(status_code=400, detail="Post is not scheduled/queued and cannot be cancelled.")
    entry = (
        db.query(PublishingQueue)
        .filter(PublishingQueue.post_id == post_id, PublishingQueue.processing_status == "Cancelled")
        .order_by(PublishingQueue.id.desc())
        .first()
    )
    return QueueActionResponse(
        message="Scheduled publishing cancelled.",
        queue_id=entry.id if entry else 0,
        processing_status="Cancelled",
    )


# ---------------------------------------------------------
# GET /publish/history — aggregate history across platforms
# ---------------------------------------------------------

@router.get("/history", response_model=List[PlatformHistoryItem])
def get_history(
    platform: Optional[str] = Query(None),
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if workspace_id is not None:
        verify_workspace_access(db, workspace_id, current_user)
    query = db.query(Post).filter(Post.status == "Published")
    query = _scope_query(query, current_user.id, workspace_id)
    posts = query.order_by(Post.published_at.desc()).all()

    items = []
    for post in posts:
        post_platforms = _post_platforms(post)
        targets = [platform] if platform else post_platforms
        for pla in targets:
            if pla in post_platforms:
                items.append(
                    PlatformHistoryItem(
                        post_id=post.id,
                        platform=pla,
                        published_at=post.published_at,
                        status=post.status,
                        platform_post_id=post.platform_post_id,
                        api_response=post.api_response,
                    )
                )
    return items


# ---------------------------------------------------------
# GET /publish/logs
# ---------------------------------------------------------

@router.get("/logs", response_model=List[dict])
def get_logs(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    workspace_id: Optional[int] = Query(None),
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

    return [
        {
            "id": log.id,
            "post_id": log.post_id,
            "title": log.post.title,
            "platform": log.platform,
            "status": log.status,
            "response": log.response,
            "retry_count": log.retry_count,
            "failure_reason": log.failure_reason,
            "platform_post_id": log.platform_post_id,
            "api_response": log.api_response,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in rows
    ]


# ---------------------------------------------------------
# GET /publish/queue
# ---------------------------------------------------------

@router.get("/queue", response_model=List[PublishingQueueItemResponse])
def get_queue(
    workspace_id: Optional[int] = Query(None),
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
    entries = query.order_by(
        PublishingQueue.execution_priority.desc(),
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