from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    type: Literal["appointment", "reminder", "cancellation", "system"]
    title: str
    message: str
    link: str | None = None
    read: bool
    created_at: datetime


class NotificationPreferencesResponse(BaseModel):
    new_appointment: bool
    reminder: bool
    cancellation: bool
    marketing: bool


class NotificationPreferencesUpdateRequest(NotificationPreferencesResponse):
    pass
