from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models.notification import Notification


def list_notifications_for_user(db: Session, user_id: str) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
    )


def get_notification(db: Session, notification_id: str) -> Notification | None:
    return db.scalar(select(Notification).where(Notification.id == notification_id))


def save_notification(db: Session, notification: Notification) -> Notification:
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def delete_notification(db: Session, notification_id: str) -> None:
    db.execute(delete(Notification).where(Notification.id == notification_id))
    db.commit()
