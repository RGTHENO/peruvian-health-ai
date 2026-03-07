from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.appointment import Appointment


def list_appointments(db: Session) -> list[Appointment]:
    return list(db.scalars(select(Appointment).order_by(Appointment.date, Appointment.time)))


def list_appointments_for_doctor(db: Session, doctor_id: str) -> list[Appointment]:
    return list(
        db.scalars(
            select(Appointment)
            .where(Appointment.doctor_id == doctor_id)
            .order_by(Appointment.date, Appointment.time)
        )
    )


def list_appointments_for_patient(db: Session, patient_id: str) -> list[Appointment]:
    return list(
        db.scalars(
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .order_by(Appointment.date, Appointment.time)
        )
    )


def get_appointment(db: Session, appointment_id: str) -> Appointment | None:
    return db.scalar(select(Appointment).where(Appointment.id == appointment_id))


def create_appointment(db: Session, appointment: Appointment) -> Appointment:
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def appointments_for_date(appointments: list[Appointment], day: date) -> list[Appointment]:
    return [appointment for appointment in appointments if appointment.date == day]
