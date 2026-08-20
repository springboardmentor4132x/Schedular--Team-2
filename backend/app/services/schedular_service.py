from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.post import Post


def get_due_posts(db: Session):
    now = datetime.now(timezone.utc)

    return (
        db.query(Post)
        .filter(
            Post.status.in_(["Scheduled", "Queued"]),
            Post.scheduled_for <= now,
        )
        .all()
    )


def publish_due_posts(db: Session):
    posts = get_due_posts(db)

    for post in posts:
        try:
            # publish to platforms

            post.status = "Published"

        except Exception as exc:
            post.status = "Failed"
            post.failure_reason = str(exc)

    db.commit()