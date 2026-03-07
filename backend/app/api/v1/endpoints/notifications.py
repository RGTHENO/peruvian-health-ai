from fastapi import APIRouter, status

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas.notification import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdateRequest,
    NotificationResponse,
)
from app.services.notifications import (
    dismiss_notification,
    get_notification_preferences,
    list_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
    update_notification_preferences,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def notifications(db: SessionDep, current_user: CurrentUserDep):
    return list_user_notifications(db, current_user)


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def notification_preferences(current_user: CurrentUserDep):
    return get_notification_preferences(current_user)


@router.patch("/preferences", response_model=NotificationPreferencesResponse)
def patch_notification_preferences(
    payload: NotificationPreferencesUpdateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    return update_notification_preferences(db, current_user, payload)


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(notification_id: str, db: SessionDep, current_user: CurrentUserDep):
    return mark_notification_as_read(db, current_user, notification_id)


@router.post("/read-all", response_model=list[NotificationResponse])
def read_all_notifications(db: SessionDep, current_user: CurrentUserDep):
    return mark_all_notifications_as_read(db, current_user)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, db: SessionDep, current_user: CurrentUserDep):
    dismiss_notification(db, current_user, notification_id)
