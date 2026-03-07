from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    specialty: Mapped[str] = mapped_column(String(120), index=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews: Mapped[int] = mapped_column(Integer, default=0)
    price: Mapped[int] = mapped_column(Integer)
    location: Mapped[str] = mapped_column(String(255))
    distance: Mapped[str] = mapped_column(String(50))
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    modalities: Mapped[list[str]] = mapped_column(JSON, default=list)
    insurances: Mapped[list[str]] = mapped_column(JSON, default=list)
    languages: Mapped[list[str]] = mapped_column(JSON, default=list)
    bio: Mapped[str] = mapped_column(String(2000))
    experience: Mapped[int] = mapped_column(Integer, default=0)
    phone: Mapped[str] = mapped_column(String(50), default="")
    avatar: Mapped[str] = mapped_column(String(500), default="")

    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
