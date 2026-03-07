from sqlalchemy import JSON, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str] = mapped_column(String(1))
    phone: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(255))
    insurance: Mapped[str] = mapped_column(String(120), index=True)
    last_visit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    avatar: Mapped[str] = mapped_column(String(500), default="")
    blood_type: Mapped[str | None] = mapped_column(String(10), nullable=True)
    conditions: Mapped[list[str]] = mapped_column(JSON, default=list)
    allergies: Mapped[list[str]] = mapped_column(JSON, default=list)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    emergency_contact_relationship: Mapped[str | None] = mapped_column(String(120), nullable=True)

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    encounters = relationship("Encounter", back_populates="patient")
