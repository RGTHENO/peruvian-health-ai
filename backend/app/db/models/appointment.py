from datetime import date, time
from enum import Enum

from sqlalchemy import Date, ForeignKey, Integer, String, Time
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class AppointmentType(str, Enum):
    IN_PERSON = "presencial"
    TELEMEDICINE = "telemedicina"


class AppointmentStatus(str, Enum):
    CONFIRMED = "confirmada"
    WAITING = "en-espera"
    CANCELLED = "cancelada"
    COMPLETED = "completada"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctor_profiles.id"), index=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient_profiles.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    time: Mapped[time] = mapped_column(Time)
    duration: Mapped[int] = mapped_column(Integer)
    type: Mapped[AppointmentType] = mapped_column(SAEnum(AppointmentType, name="appointment_type"))
    status: Mapped[AppointmentStatus] = mapped_column(
        SAEnum(AppointmentStatus, name="appointment_status")
    )
    reason: Mapped[str] = mapped_column(String(500))
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    doctor = relationship("DoctorProfile", back_populates="appointments")
    patient = relationship("PatientProfile", back_populates="appointments")
    encounters = relationship("Encounter", back_populates="appointment")
