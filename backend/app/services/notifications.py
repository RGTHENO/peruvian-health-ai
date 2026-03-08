from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.db.models.notification import Notification
from app.db.models.user import User
from app.repositories.notifications import (
    delete_notification,
    get_notification,
    list_notifications_for_user,
)
from app.schemas.notification import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdateRequest,
    NotificationResponse,
)


def _serialize_notification(notification: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=notification.id,
        type=notification.type.value,
        title=notification.title,
        message=notification.message,
        link=notification.link,
        read=notification.read,
        created_at=notification.created_at,
    )


def list_user_notifications(db: Session, user: User) -> list[NotificationResponse]:
    return [_serialize_notification(item) for item in list_notifications_for_user(db, user.id)]


def get_notification_preferences(user: User) -> NotificationPreferencesResponse:
    preferences = {
        **User.DEFAULT_NOTIFICATION_PREFERENCES,
        **(user.notification_preferences or {}),
    }
    return NotificationPreferencesResponse(**preferences)


def update_notification_preferences(
    db: Session, user: User, payload: NotificationPreferencesUpdateRequest
) -> NotificationPreferencesResponse:
    user.notification_preferences = payload.model_dump()
    db.add(user)
    db.commit()
    db.refresh(user)
    return get_notification_preferences(user)


def mark_notification_as_read(db: Session, user: User, notification_id: str) -> NotificationResponse:
    notification = get_notification(db, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada"
        )

    notification.read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return _serialize_notification(notification)


def mark_all_notifications_as_read(db: Session, user: User) -> list[NotificationResponse]:
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .values(read=True)
    )
    db.commit()
    return [
        _serialize_notification(item) for item in list_notifications_for_user(db, user.id)
    ]


def dismiss_notification(db: Session, user: User, notification_id: str) -> None:
    notification = get_notification(db, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada"
        )
    delete_notification(db, notification_id)
