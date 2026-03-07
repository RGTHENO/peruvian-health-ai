from datetime import date, time
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.db.models.notification import Notification, NotificationType
from app.db.models.user import User, UserRole
from app.repositories.appointments import create_appointment, get_appointment, list_appointments
from app.repositories.doctors import get_doctor, get_doctor_by_user_id
from app.repositories.patients import get_patient, get_patient_by_user_id
from app.schemas.appointment import AppointmentCreateRequest
from app.services.serializers import format_time, serialize_appointment


def list_user_appointments(db: Session, user: User):
    appointments = list_appointments(db)
    if user.role == UserRole.DOCTOR:
        doctor = get_doctor_by_user_id(db, user.id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil médico no encontrado",
            )
        appointments = [
            appointment for appointment in appointments if appointment.doctor_id == doctor.id
        ]
    elif user.role == UserRole.PATIENT:
        patient = get_patient_by_user_id(db, user.id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil de paciente no encontrado",
            )
        appointments = [
            appointment for appointment in appointments if appointment.patient_id == patient.id
        ]

    return [serialize_appointment(appointment) for appointment in appointments]


def create_new_appointment(db: Session, payload: AppointmentCreateRequest, user: User):
    if user.role != UserRole.PATIENT or not user.patient_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Solo un paciente puede agendar citas"
        )

    patient_id = user.patient_profile.id
    if payload.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes agendar citas para otro paciente",
        )

    doctor = get_doctor(db, payload.doctor_id)
    patient = get_patient(db, patient_id)
    if not doctor or not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor o paciente inválido"
        )

    appointment = Appointment(
        id=f"apt-{uuid4()}",
        doctor_id=payload.doctor_id,
        patient_id=patient_id,
        date=date.fromisoformat(payload.date),
        time=time.fromisoformat(f"{payload.time}:00"),
        duration=payload.duration,
        type=AppointmentType(payload.type),
        status=AppointmentStatus.WAITING,
        reason=payload.reason,
        notes=payload.notes,
    )
    saved_appointment = create_appointment(db, appointment)

    if doctor.user_id:
        db.add(
            Notification(
                id=f"notif-{uuid4()}",
                user_id=doctor.user_id,
                type=NotificationType.APPOINTMENT,
                title="Nueva cita agendada",
                message=(
                    f"{patient.name} agendó una consulta para el "
                    f"{saved_appointment.date} a las {format_time(saved_appointment.time)}."
                ),
                link="/doctor/portal/agenda",
                read=False,
            )
        )
        db.commit()

    return serialize_appointment(saved_appointment)


def update_appointment_status(db: Session, appointment_id: str, next_status: str, user: User):
    appointment = get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")

    if user.role == UserRole.DOCTOR:
        doctor = get_doctor_by_user_id(db, user.id)
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes modificar citas de otro médico",
            )
    elif user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar esta cita",
        )

    appointment.status = AppointmentStatus(next_status)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return serialize_appointment(appointment)
