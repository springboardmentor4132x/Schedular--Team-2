from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    TeamActivityResponse,
)
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ---------------------------------------------------------
# Notification Center
# ---------------------------------------------------------

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = Query(False),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.get_all_notifications(
        db, current_user.id, unread_only, category, search
    )


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.get_notification_by_id(db, current_user.id, notification_id)


@router.post("/{notification_id}/read")
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.mark_notification_read(db, current_user.id, notification_id)


@router.post("/read-all")
def read_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.mark_all_notifications_read(db, current_user.id)


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.delete_notification(db, current_user.id, notification_id)


@router.delete("/")
def clear_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.clear_all_notifications(db, current_user.id)


# ---------------------------------------------------------
# Notification Preferences
# ---------------------------------------------------------

@router.get("/preferences/settings", response_model=NotificationPreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.get_preferences(db, current_user.id)


@router.put("/preferences/settings", response_model=NotificationPreferenceResponse)
def update_preferences(
    updates: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.update_preferences(
        db, current_user.id, updates.model_dump(exclude_none=True)
    )


# ---------------------------------------------------------
# Team Activity Feed
# ---------------------------------------------------------

@router.get("/team/activity")
def get_team_activity(
    campaign_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activities = notification_service.get_team_activity(db, current_user.id, campaign_id)
    return [
        {
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "category": getattr(a, "category", "collaboration"),
            "created_at": a.created_at,
        }
        for a in activities
    ]