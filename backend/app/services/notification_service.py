from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.social_account import SocialAccount

NOW = datetime.now(timezone.utc)


def _serialize(notif: Notification):
    return {
        "id": notif.id,
        "user_id": notif.user_id,
        "type": notif.type,
        "title": notif.title,
        "message": notif.message,
        "read": notif.read,
        "created_at": notif.created_at,
    }


def _candidates(db: Session, user_id: int):
    """Derive notifications from real user data (posts, campaigns, accounts)."""
    candidates = []

    posts = (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.created_at.desc())
        .all()
    )
    for post in posts[:10]:
        name = post.title or f"Post #{post.id}"
        platforms = ", ".join(acc.platform for acc in post.social_accounts) or "your channels"

        if post.status == "Scheduled" and post.scheduled_for:
            candidates.append({
                "signature": f"post-scheduled:{post.id}",
                "type": "info",
                "title": "Post Scheduled",
                "message": f'"{name}" is scheduled for {post.scheduled_for.strftime("%b %d, %Y %H:%M")}.',
            })
        elif post.status == "Published":
            candidates.append({
                "signature": f"post-published:{post.id}",
                "type": "success",
                "title": "Post Published",
                "message": f'"{name}" was published to {platforms}.',
            })
        elif post.status == "Failed":
            candidates.append({
                "signature": f"post-failed:{post.id}",
                "type": "error",
                "title": "Publishing Failed",
                "message": f'"{name}" could not be published. Click to retry.',
            })

    campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .all()
    )
    for campaign in campaigns:
        if campaign.status == "Active":
            if campaign.end_date and campaign.end_date <= (NOW + timedelta(days=3)).date():
                candidates.append({
                    "signature": f"campaign-ending:{campaign.id}",
                    "type": "campaign",
                    "title": "Campaign Ending Soon",
                    "message": f'Campaign "{campaign.name}" ends on {campaign.end_date.strftime("%b %d, %Y")}.',
                })
            if campaign.start_date and campaign.start_date <= (NOW + timedelta(days=2)).date() and campaign.start_date >= NOW.date():
                candidates.append({
                    "signature": f"campaign-starting:{campaign.id}",
                    "type": "campaign",
                    "title": "Campaign Starting Soon",
                    "message": f'Campaign "{campaign.name}" starts on {campaign.start_date.strftime("%b %d, %Y")}.',
                })

    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
    for account in accounts:
        label = account.username or account.platform
        if account.health and account.health.lower() != "healthy":
            candidates.append({
                "signature": f"account-health:{account.id}",
                "type": "error",
                "title": "Account Health Issue",
                "message": f"{account.platform} account ({label}) needs your attention.",
            })
        if account.token_expires_at:
            expires_in = account.token_expires_at - NOW
            if timedelta(0) <= expires_in <= timedelta(days=7):
                candidates.append({
                    "signature": f"token-expiry:{account.id}",
                    "type": "info",
                    "title": "Token Expiring Soon",
                    "message": f"{account.platform} token expires in {max(1, expires_in.days)} day(s). Reconnect to avoid disruptions.",
                })

    return candidates


_STATUS_PREFIXES = (
    "post-scheduled:",
    "post-published:",
    "post-failed:",
    "campaign-ending:",
    "campaign-starting:",
    "account-health:",
    "token-expiry:",
)


def sync_notifications(db: Session, user_id: int):
    """Create notifications for anything new found in the user's real data.

    Also drops previously-synced status notifications whose underlying
    condition no longer holds (e.g. a post was scheduled but is now
    published), so the unread badge only reflects current activity.
    """
    existing = {
        n.signature
        for n in db.query(Notification.signature).filter(Notification.user_id == user_id).all()
        if n.signature
    }

    candidates = _candidates(db, user_id)
    current = {c["signature"] for c in candidates}

    stored = db.query(Notification).filter(Notification.user_id == user_id).all()
    for notif in stored:
        if (
            notif.signature
            and notif.signature.startswith(_STATUS_PREFIXES)
            and notif.signature not in current
        ):
            db.delete(notif)

    for candidate in candidates:
        if candidate["signature"] in existing:
            continue
        db.add(Notification(user_id=user_id, **candidate))
        existing.add(candidate["signature"])

    db.commit()


def get_all_notifications(db: Session, user_id: int):
    sync_notifications(db, user_id)
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return [_serialize(n) for n in notifications]


def _get_owned_notification(db: Session, user_id: int, notification_id: int) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this notification")
    return notification


def mark_notification_read(db: Session, user_id: int, notification_id: int):
    notification = _get_owned_notification(db, user_id, notification_id)
    notification.read = True
    db.commit()
    db.refresh(notification)
    return _serialize(notification)


def mark_all_notifications_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).update(
        {"read": True}
    )
    db.commit()
    return {"message": "All notifications marked as read"}


def delete_notification(db: Session, user_id: int, notification_id: int):
    notification = _get_owned_notification(db, user_id, notification_id)
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}


def clear_all_notifications(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.commit()
    return {"message": "All notifications cleared"}
