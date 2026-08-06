import json
import importlib
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.publishing_log import PublishingLog
from app.models.publishing_queue import PublishingQueue

RETRY_INTERVAL_MINUTES = 5


# ---------------------------------------------------------
# Queue entry point (called by the background worker)
# ---------------------------------------------------------

def process_publishing_queue(db: Session):
    """Main entry point — polls due queue entries and processes each."""
    entries = get_due_queue_entries(db)
    for entry in entries:
        process_queue_entry(db, entry)


def get_due_queue_entries(db: Session):
    now = datetime.now(timezone.utc)
    return (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.processing_status == "Pending",
            PublishingQueue.scheduled_time <= now,
        )
        .order_by(
            PublishingQueue.execution_priority.desc(),
            PublishingQueue.scheduled_time.asc(),
        )
        .all()
    )


def enqueue_post(db: Session, post: Post, priority: int = 0) -> PublishingQueue:
    """Called when a post is scheduled (Module 3) — registers it in the queue."""
    entry = PublishingQueue(
        post_id=post.id,
        scheduled_time=post.scheduled_for,
        execution_priority=priority,
    )
    post.status = "Scheduled"
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ---------------------------------------------------------
# Core processing of a single queue entry
# ---------------------------------------------------------

def process_queue_entry(db: Session, entry: PublishingQueue):
    post = db.query(Post).filter(Post.id == entry.post_id).first()
    if not post:
        entry.processing_status = "Failed"
        db.commit()
        return

    entry.processing_status = "Processing"
    post.status = "Publishing"
    db.commit()

    social_accounts = post.social_accounts
    if not social_accounts:
        _mark_failed(db, post, entry, "No social accounts linked to this post.")
        return

    all_succeeded = True
    failure_reasons = []

    for account in social_accounts:
        token_error = validate_account_token(account)
        if token_error:
            all_succeeded = False
            failure_reasons.append(f"{account.platform}: {token_error}")
            log_publishing_attempt(
                db, post.id, account.platform, "Failed",
                {"failure_reason": token_error}, entry.retry_count,
            )
            continue

        result = dispatch_publish(account.platform, post, account)

        if result.get("success"):
            post.platform_post_id = result.get("platform_post_id")
            post.api_response = json.dumps(result.get("raw_response"))
            log_publishing_attempt(
                db, post.id, account.platform, "Published", result, entry.retry_count,
            )
        else:
            all_succeeded = False
            reason = result.get("failure_reason", "Unknown error")
            failure_reasons.append(f"{account.platform}: {reason}")
            log_publishing_attempt(
                db, post.id, account.platform, "Failed", result, entry.retry_count,
            )

    if all_succeeded:
        post.status = "Published"
        post.published_at = datetime.now(timezone.utc)
        post.failure_reason = None
        entry.processing_status = "Completed"
        db.commit()
    else:
        post.failure_reason = "; ".join(failure_reasons)
        _handle_retry_or_fail(db, post, entry)


def _handle_retry_or_fail(db: Session, post: Post, entry: PublishingQueue):
    if entry.retry_count < entry.max_retries:
        entry.retry_count += 1
        post.retry_count = entry.retry_count
        entry.processing_status = "Pending"
        entry.scheduled_time = datetime.now(timezone.utc) + timedelta(
            minutes=RETRY_INTERVAL_MINUTES
        )
        post.status = "Scheduled"
    else:
        entry.processing_status = "Failed"
        post.status = "Failed"
    db.commit()


def _mark_failed(db: Session, post: Post, entry: PublishingQueue, reason: str):
    post.status = "Failed"
    post.failure_reason = reason
    entry.processing_status = "Failed"
    db.commit()


# ---------------------------------------------------------
# Platform dispatch (simulated fallback per module spec)
# ---------------------------------------------------------

def dispatch_publish(platform: str, post: Post, account: SocialAccount) -> dict:
    """
    Tries the real per-platform service (facebook_service.py, etc.) if it
    implements `publish_post(post, account)`. Falls back to a simulated
    response — per the module note about dev-account API restrictions —
    so the workflow, logging, and status updates stay fully testable.
    """
    try:
        module = importlib.import_module(f"app.services.{platform}_service")
        publish_fn = getattr(module, "publish_post", None)
        if publish_fn:
            return publish_fn(post, account)
    except ModuleNotFoundError:
        pass

    return simulate_publish(platform, post)


def simulate_publish(platform: str, post: Post) -> dict:
    import uuid
    return {
        "success": True,
        "platform_post_id": f"SIM-{platform.upper()}-{uuid.uuid4().hex[:10]}",
        "raw_response": {"simulated": True, "message": f"Simulated publish to {platform}"},
    }


def validate_account_token(account: SocialAccount) -> Optional[str]:
    if account.status != "Connected":
        return f"Account status is '{account.status}', not Connected."
    if account.token_expires_at and account.token_expires_at <= datetime.now(timezone.utc):
        return "Access token has expired."
    return None


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

def log_publishing_attempt(
    db: Session, post_id: int, platform: str, status: str, result: dict, retry_count: int
):
    payload = {
        "raw_response": result.get("raw_response", result),
        "platform_post_id": result.get("platform_post_id"),
        "failure_reason": result.get("failure_reason") if status == "Failed" else None,
    }
    log = PublishingLog(
        post_id=post_id,
        platform=platform,
        status=status,
        response=json.dumps(payload),
        retry_count=retry_count,
    )
    db.add(log)
    db.commit()


# ---------------------------------------------------------
# Queue actions (used by routers — reschedule / cancel / retry)
# ---------------------------------------------------------

def reschedule_entry(db: Session, queue_id: int, new_time: datetime):
    entry = db.query(PublishingQueue).filter(PublishingQueue.id == queue_id).first()
    if not entry:
        return None
    entry.scheduled_time = new_time
    entry.processing_status = "Pending"
    post = db.query(Post).filter(Post.id == entry.post_id).first()
    if post:
        post.scheduled_for = new_time
        post.status = "Scheduled"
    db.commit()
    db.refresh(entry)
    return entry


def cancel_entry(db: Session, queue_id: int):
    entry = db.query(PublishingQueue).filter(PublishingQueue.id == queue_id).first()
    if not entry:
        return None
    entry.processing_status = "Cancelled"
    post = db.query(Post).filter(Post.id == entry.post_id).first()
    if post:
        post.status = "Cancelled"
    db.commit()
    db.refresh(entry)
    return entry


def pause_entry(db: Session, queue_id: int):
    entry = db.query(PublishingQueue).filter(PublishingQueue.id == queue_id).first()
    if not entry or entry.processing_status not in ("Pending", "Processing"):
        return None
    entry.processing_status = "Paused"
    db.commit()
    db.refresh(entry)
    return entry


def resume_entry(db: Session, queue_id: int):
    entry = db.query(PublishingQueue).filter(PublishingQueue.id == queue_id).first()
    if not entry or entry.processing_status != "Paused":
        return None
    entry.processing_status = "Pending"
    db.commit()
    db.refresh(entry)
    return entry


def retry_failed_post(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.status != "Failed":
        return None

    entry = (
        db.query(PublishingQueue)
        .filter(PublishingQueue.post_id == post_id)
        .order_by(PublishingQueue.id.desc())
        .first()
    )
    if not entry:
        entry = PublishingQueue(post_id=post_id, scheduled_time=datetime.now(timezone.utc))
        db.add(entry)

    entry.processing_status = "Pending"
    entry.scheduled_time = datetime.now(timezone.utc)
    entry.retry_count = 0
    post.status = "Scheduled"
    post.failure_reason = None
    db.commit()
    db.refresh(post)
    return post