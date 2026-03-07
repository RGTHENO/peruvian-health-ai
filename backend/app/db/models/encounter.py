from datetime import UTC, date, datetime
from enum import Enum

from sqlalchemy import JSON, Date, DateTime, ForeignKey, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import Base


class EncounterKind(str, Enum):
    CONSULTATION = "consultation"
    LAB = "lab"
    SURGERY = "surgery"


class Encounter(Base):
    __tablename__ = "encounters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient_profiles.id"), index=True)
    doctor_id: Mapped[str | None] = mapped_column(ForeignKey("doctor_profiles.id"), nullable=True)
    appointment_id: Mapped[str | None] = mapped_column(ForeignKey("appointments.id"), nullable=True)
    kind: Mapped[EncounterKind] = mapped_column(
        SAEnum(EncounterKind, name="encounter_kind"), index=True
    )
    occurred_on: Mapped[date] = mapped_column(Date, index=True)
    actor_name: Mapped[str] = mapped_column(String(255))
    specialty: Mapped[str | None] = mapped_column(String(120), nullable=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    patient = relationship("PatientProfile", back_populates="encounters")
    appointment = relationship("Appointment", back_populates="encounters")
