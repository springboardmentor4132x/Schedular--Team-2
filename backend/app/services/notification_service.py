from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.notification_preference import NotificationPreference


# ---------------------------------------------------------
# Notification Center
# ---------------------------------------------------------

def get_all_notifications(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Notification]:
    """Returns the user's notifications, newest first, with optional filters."""
    query = db.query(Notification).filter(Notification.user_id == user_id)

    if unread_only:
        query = query.filter(Notification.read == False)  # noqa: E712
    if category:
        query = query.filter(Notification.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(
            Notification.title.ilike(like) | Notification.message.ilike(like)
        )

    return query.order_by(Notification.created_at.desc()).all()


def get_unread_count(db: Session, user_id: int) -> int:
    """Number of unread notifications for the user."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.read == False)  # noqa: E712
        .count()
    )


def get_notification_by_id(db: Session, user_id: int, notification_id: int) -> Optional[Notification]:
    """Returns a single notification, scoped to the user."""
    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )


def mark_notification_read(db: Session, user_id: int, notification_id: int) -> Optional[Notification]:
    """Marks one notification as read. Returns None when it does not exist."""
    notification = get_notification_by_id(db, user_id, notification_id)
    if notification is None:
        return None

    notification.read = True
    notification.read_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_notifications_read(db: Session, user_id: int) -> dict:
    """Marks every notification of the user as read."""
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.read == False)  # noqa: E712
        .update(
            {
                "read": True,
                "read_at": datetime.now(timezone.utc),
            }
        )
    )
    db.commit()
    return {"updated": updated}


def delete_notification(db: Session, user_id: int, notification_id: int) -> bool:
    """Deletes a single notification. Returns False when it does not exist."""
    notification = get_notification_by_id(db, user_id, notification_id)
    if notification is None:
        return False

    db.delete(notification)
    db.commit()
    return True


def clear_all_notifications(db: Session, user_id: int) -> dict:
    """Deletes all notifications of the user."""
    deleted = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .delete()
    )
    db.commit()
    return {"deleted": deleted}


# ---------------------------------------------------------
# Notification Preferences
# ---------------------------------------------------------

def get_preferences(db: Session, user_id: int) -> NotificationPreference:
    """Returns the user's notification preferences, creating defaults on first access."""
    prefs = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == user_id)
        .first()
    )
    if prefs is None:
        prefs = NotificationPreference(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


def update_preferences(db: Session, user_id: int, updates: dict) -> NotificationPreference:
    """Applies the provided preference updates for the user."""
    prefs = get_preferences(db, user_id)
    for key, value in updates.items():
        if hasattr(prefs, key):
            setattr(prefs, key, value)
    db.commit()
    db.refresh(prefs)
    return prefs


# ---------------------------------------------------------
# Team Activity Feed
# ---------------------------------------------------------

def get_team_activity(
    db: Session,
    user_id: int,
    campaign_id: Optional[int] = None,
) -> List[Notification]:
    """Returns collaboration/publishing activity for the user's team, newest first.

    Notifications carry no campaign association yet, so campaign_id is accepted
    for API compatibility but does not filter the results.
    """
    query = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.category.in_(["collaboration", "publishing"]),
        )
    )
    return query.order_by(Notification.created_at.desc()).all()
