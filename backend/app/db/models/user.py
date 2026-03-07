from datetime import UTC, datetime
from enum import Enum

from sqlalchemy import JSON, Boolean, DateTime, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    DEFAULT_NOTIFICATION_PREFERENCES = {
        "new_appointment": True,
        "reminder": True,
        "cancellation": True,
        "marketing": False,
    }

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role"), index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_preferences: Mapped[dict[str, bool]] = mapped_column(
        JSON, default=lambda: dict(User.DEFAULT_NOTIFICATION_PREFERENCES)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user")
