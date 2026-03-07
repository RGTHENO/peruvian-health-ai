from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.appointment import AppointmentStatus
from app.db.models.user import User
from app.repositories.appointments import (
    list_appointments_for_doctor,
    list_appointments_for_patient,
)
from app.repositories.doctors import get_doctor_by_user_id
from app.repositories.encounters import list_encounters_for_patient
from app.repositories.patients import get_patient
from app.schemas.dashboard import DashboardCounts, DoctorDashboardResponse
from app.services.serializers import (
    format_date,
    serialize_appointment,
    serialize_encounter,
    serialize_patient_detail,
    serialize_patient_summary,
)


def _pick_active_date(appointments):
    if not appointments:
        return date.today()
    unique_dates = sorted({appointment.date for appointment in appointments})
    today = date.today()
    for day in unique_dates:
        if day >= today:
            return day
    return unique_dates[-1]


def get_doctor_dashboard(db: Session, user: User) -> DoctorDashboardResponse:
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    appointments = list_appointments_for_doctor(db, doctor.id)
    active_date = _pick_active_date(appointments)
    today_appointments = [
        appointment for appointment in appointments if appointment.date == active_date
    ]
    patients_by_id = {appointment.patient.id: appointment.patient for appointment in appointments}
    recent_patients = list(patients_by_id.values())[:4]

    return DoctorDashboardResponse(
        active_date=format_date(active_date),
        active_date_label=active_date.strftime("%A, %-d de %B de %Y").capitalize(),
        counts=DashboardCounts(
            citas_hoy=len(today_appointments),
            confirmadas=sum(
                appointment.status == AppointmentStatus.CONFIRMED
                for appointment in today_appointments
            ),
            en_espera=sum(
                appointment.status == AppointmentStatus.WAITING
                for appointment in today_appointments
            ),
            canceladas=sum(
                appointment.status == AppointmentStatus.CANCELLED
                for appointment in today_appointments
            ),
            total_pacientes=len(patients_by_id),
        ),
        upcoming_today=[
            serialize_appointment(appointment)
            for appointment in today_appointments
            if appointment.status not in {AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED}
        ],
        recent_patients=[serialize_patient_summary(patient) for patient in recent_patients],
    )


def get_doctor_agenda(db: Session, user: User, for_date: str | None = None):
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    appointments = list_appointments_for_doctor(db, doctor.id)
    serialized = [serialize_appointment(appointment) for appointment in appointments]
    if for_date:
        serialized = [appointment for appointment in serialized if appointment.date == for_date]
    return serialized


def get_doctor_patients(db: Session, user: User, search: str | None = None):
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    appointments = list_appointments_for_doctor(db, doctor.id)
    patients = {}
    for appointment in appointments:
        patients[appointment.patient.id] = appointment.patient

    items = [serialize_patient_summary(patient) for patient in patients.values()]
    query = (search or "").strip().lower()
    if query:
        items = [
            patient
            for patient in items
            if query in patient.name.lower()
            or query in patient.insurance.lower()
            or any(query in condition.lower() for condition in patient.conditions)
        ]
    return sorted(items, key=lambda patient: patient.name)


def get_doctor_patient_record(db: Session, user: User, patient_id: str):
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")

    appointments = [
        serialize_appointment(appointment)
        for appointment in list_appointments_for_patient(db, patient_id)
        if appointment.status not in {AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED}
    ]
    encounters = [
        serialize_encounter(encounter) for encounter in list_encounters_for_patient(db, patient_id)
    ]
    return {
        "patient": serialize_patient_detail(patient),
        "upcoming_appointments": appointments,
        "encounters": encounters,
    }
