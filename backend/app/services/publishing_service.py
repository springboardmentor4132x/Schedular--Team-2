import json
import importlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.publishing_log import PublishingLog
from app.models.publishing_queue import PublishingQueue

RETRY_INTERVAL_MINUTES = 5

# Entries left in "Processing" longer than this (e.g. by a crashed or
# restarted worker) are reset to "Pending" so they get processed again.
STALE_PROCESSING_MINUTES = 10

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Queue entry point (called by the background worker)
# ---------------------------------------------------------

def process_publishing_queue(db: Session):
    _recover_stale_processing(db)
    entries = get_due_queue_entries(db)
    for entry in entries:
        try:
            process_queue_entry(db, entry)
        except Exception:
            logger.exception("Error processing queue entry %s — marking as failed", entry.id)
            try:
                db.rollback()
            except Exception:
                logger.exception("Rollback failed for entry %s", entry.id)
                continue

            # ✅ Wrap recovery in its own try/except so one failure doesn't block others
            try:
                post = db.query(Post).filter(Post.id == entry.post_id).first()
                entry = db.query(PublishingQueue).filter(PublishingQueue.id == entry.id).first()
                if post and entry:
                    _mark_failed(db, post, entry, "Unexpected error while publishing.")
                elif entry:
                    entry.processing_status = "Failed"
                    db.commit()
            except Exception:
                logger.exception("Failed to mark entry %s as failed after crash", entry.id)


def _recover_stale_processing(db: Session):
    """Reset queue entries stuck in "Processing" past a safety timeout so the
    worker picks them up again instead of leaving their posts stuck in
    "Publishing" forever."""
    threshold = datetime.now(timezone.utc) - timedelta(minutes=STALE_PROCESSING_MINUTES)
    stale = (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.processing_status == "Processing",
            PublishingQueue.updated_at < threshold,
        )
        .all()
    )
    for entry in stale:
        entry.processing_status = "Pending"
        post = db.query(Post).filter(Post.id == entry.post_id).first()
        if post and post.status == "Publishing":
            post.status = "Scheduled"
    if stale:
        db.commit()


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
    """Called when a post is scheduled (Module 3) — registers it in the queue.
    Idempotent: re-scheduling an already-pending post just updates the time."""
    existing = (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.post_id == post.id,
            PublishingQueue.processing_status.in_(["Pending", "Processing"]),
        )
        .order_by(PublishingQueue.id.desc())
        .first()
    )
    if existing:
        existing.scheduled_time = post.scheduled_for
        post.status = "Scheduled"
        db.commit()
        db.refresh(existing)
        return existing

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

    # Idempotency guard
    if post.status == "Published":
        entry.processing_status = "Completed"
        db.commit()
        return

    # Fetch social accounts BEFORE committing and changing state, 
    # ensuring they are safely bound to the active session.
    social_accounts = (
        db.query(SocialAccount)
        .join(Post.social_accounts)
        .filter(Post.id == post.id)
        .all()
    )

    if not social_accounts:
        _mark_failed(db, post, entry, "No social accounts linked to this post.")
        return

    # Now transition status safely
    entry.processing_status = "Processing"
    post.status = "Publishing"
    db.commit()

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

        try:
            result = dispatch_publish(account.platform, post, account)
        except Exception as exc:
            logger.exception("Dispatch to %s raised for post %s", account.platform, post.id)
            all_succeeded = False
            reason = str(exc) or "Unknown error"
            failure_reasons.append(f"{account.platform}: {reason}")
            log_publishing_attempt(
                db, post.id, account.platform, "Failed",
                {"failure_reason": reason}, entry.retry_count,
            )
            continue

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
    else:
        post.status = "Failed"
        post.failure_reason = "; ".join(failure_reasons)
        _handle_retry_or_fail(db, post, entry)

    # FINAL ATOMIC COMMIT
    db.commit()


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
    # ✅ Only use columns that exist in PublishingLog model
    payload = {
        "raw_response": result.get("raw_response", result),
        "platform_post_id": result.get("platform_post_id"),
        "failure_reason": result.get("failure_reason") if status == "Failed" else None,
    }
    log = PublishingLog(
        post_id=post_id,
        platform=platform,
        status=status,
        response=json.dumps(payload, default=str),  # store extras in response JSON
        retry_count=retry_count,
    )
    db.add(log)
    # db.commit()


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


def publish_post_immediately(db: Session, post_id: int):
    """Publish a single post right now — enqueues and processes it inline
    through the shared pipeline (token validation, dispatch, logging).

    A manual "Publish Now" must not silently re-queue on failure: the entry
    is created with retries exhausted so a failed attempt immediately marks
    the post Failed (and the caller sees the real status).

    Any other pending/processing queue entries for the same post are cancelled
    first so the background worker doesn't re-publish it at a later time."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.status not in ("Scheduled", "Queued", "Failed", "Draft"):
        return None

    # Cancel other queued attempts for this post (e.g. the original scheduled entry).
    for other in (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.post_id == post_id,
            PublishingQueue.processing_status.in_(["Pending", "Processing"]),
        )
        .all()
    ):
        other.processing_status = "Cancelled"

    entry = PublishingQueue(
        post_id=post_id,
        scheduled_time=datetime.now(timezone.utc),
        max_retries=0,  # no auto-retry for a manual publish
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    process_queue_entry(db, entry)
    db.refresh(post)
    return post


def cancel_post(db: Session, post_id: int):
    """Cancel a scheduled/queued post by its post id (cancels its queue entries)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    entries = (
        db.query(PublishingQueue)
        .filter(
            PublishingQueue.post_id == post_id,
            PublishingQueue.processing_status.in_(["Pending", "Processing"]),
        )
        .all()
    )
    for entry in entries:
        entry.processing_status = "Cancelled"
    post.status = "Cancelled"
    db.commit()
    db.refresh(post)
    return post


def verify_account_token(account: SocialAccount) -> Optional[str]:
    return validate_account_token(account)