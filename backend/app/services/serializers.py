from datetime import date, time

from app.core.config import get_settings
from app.db.models.appointment import Appointment, AppointmentType
from app.db.models.doctor import DoctorProfile
from app.db.models.encounter import Encounter, EncounterKind
from app.db.models.patient import PatientProfile
from app.schemas.appointment import AppointmentSummary
from app.schemas.doctor import DoctorSummary
from app.schemas.encounter import (
    ConsultationEncounterResponse,
    EncounterResponse,
    LabEncounterResponse,
    PrescriptionItem,
    SurgeryEncounterResponse,
)
from app.schemas.patient import EmergencyContact, PatientDetail, PatientSummary


def format_date(value: date) -> str:
    return value.isoformat()


def format_time(value: time) -> str:
    return value.strftime("%H:%M")


def serialize_doctor(doctor: DoctorProfile) -> DoctorSummary:
    return DoctorSummary(
        id=doctor.id,
        name=doctor.name,
        specialty=doctor.specialty,
        rating=doctor.rating,
        reviews=doctor.reviews,
        price=doctor.price,
        location=doctor.location,
        distance=doctor.distance,
        available=doctor.available,
        modality=doctor.modalities,
        insurance=doctor.insurances,
        languages=doctor.languages,
        bio=doctor.bio,
        experience=doctor.experience,
        avatar=doctor.avatar,
    )


def serialize_patient_summary(patient: PatientProfile) -> PatientSummary:
    return PatientSummary(
        id=patient.id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        email=patient.email,
        telegram_handle=patient.telegram_handle,
        insurance=patient.insurance,
        last_visit=patient.last_visit,
        conditions=patient.conditions,
        avatar=patient.avatar,
        blood_type=patient.blood_type,
    )


def serialize_patient_detail(patient: PatientProfile) -> PatientDetail:
    emergency_contact = None
    if (
        patient.emergency_contact_name
        and patient.emergency_contact_phone
        and patient.emergency_contact_relationship
    ):
        emergency_contact = EmergencyContact(
            name=patient.emergency_contact_name,
            phone=patient.emergency_contact_phone,
            relationship=patient.emergency_contact_relationship,
        )

    return PatientDetail(
        **serialize_patient_summary(patient).model_dump(),
        allergies=patient.allergies,
        emergency_contact=emergency_contact,
    )


def serialize_appointment(appointment: Appointment) -> AppointmentSummary:
    frontend_url = get_settings().frontend_url.rstrip("/")
    is_telemedicine = appointment.type == AppointmentType.TELEMEDICINE
    patient = appointment.patient
    doctor = appointment.doctor

    join_url = f"{frontend_url}/teleconsulta?appointment={appointment.id}" if is_telemedicine else None
    whatsapp_enabled = bool((patient.phone or "").strip())
    telegram_enabled = bool((patient.telegram_handle or "").strip())

    return AppointmentSummary(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=patient.name,
        doctor_id=appointment.doctor_id,
        doctor_name=doctor.name,
        date=format_date(appointment.date),
        time=format_time(appointment.time),
        duration=appointment.duration,
        type=appointment.type.value,
        status=appointment.status.value,
        reason=appointment.reason,
        notes=appointment.notes,
        delivery={
            "email": {
                "enabled": True,
                "destination": patient.email,
                "status": "scheduled",
                "summary": "Enviaremos la confirmacion, el detalle de la cita y el acceso correspondiente por email.",
            },
            "whatsapp": {
                "enabled": whatsapp_enabled,
                "destination": patient.phone if whatsapp_enabled else None,
                "status": "scheduled" if whatsapp_enabled else "unavailable",
                "summary": (
                    "Enviaremos resumen y recordatorios por WhatsApp al numero registrado."
                    if whatsapp_enabled
                    else "Necesitamos un numero celular valido para enviar WhatsApp."
                ),
            },
            "telegram": {
                "enabled": telegram_enabled,
                "destination": f"@{patient.telegram_handle}" if telegram_enabled else None,
                "status": "scheduled" if telegram_enabled else "unavailable",
                "summary": (
                    "Telegram recibira el mismo resumen y recordatorios del enlace."
                    if telegram_enabled
                    else "Telegram solo se habilita cuando el paciente vincula su usuario."
                ),
            },
            "access": {
                "type": appointment.type.value,
                "instructions": (
                    "Recibirás el enlace de ingreso y recordatorios por los canales habilitados."
                    if is_telemedicine
                    else f"Presentate en {doctor.location} 10 minutos antes de la cita."
                ),
                "join_url": join_url,
                "location": None if is_telemedicine else doctor.location,
            },
        },
    )


def serialize_encounter(encounter: Encounter) -> EncounterResponse:
    payload = encounter.payload
    if encounter.kind == EncounterKind.CONSULTATION:
        return ConsultationEncounterResponse(
            type="consultation",
            patient_id=encounter.patient_id,
            date=format_date(encounter.occurred_on),
            doctor=encounter.actor_name,
            specialty=encounter.specialty or "",
            diagnosis=payload["diagnosis"],
            diagnosis_status=payload["diagnosis_status"],
            prescriptions=[
                PrescriptionItem.model_validate(item) for item in payload["prescriptions"]
            ],
            recommendations=payload["recommendations"],
            lab_orders=payload["lab_orders"],
            notes=payload.get("notes"),
        )

    if encounter.kind == EncounterKind.LAB:
        return LabEncounterResponse(
            type="lab",
            patient_id=encounter.patient_id,
            date=format_date(encounter.occurred_on),
            lab=encounter.actor_name,
            ordered_by=payload["ordered_by"],
            lab_results=payload["lab_results"],
        )

    return SurgeryEncounterResponse(
        type="surgery",
        patient_id=encounter.patient_id,
        date=format_date(encounter.occurred_on),
        surgeon=encounter.actor_name,
        specialty=encounter.specialty or "",
        hospital=payload["hospital"],
        procedure=payload["procedure"],
        procedure_type=payload["procedure_type"],
        anesthesia_type=payload["anesthesia_type"],
        duration=payload["duration"],
        pre_op_diagnosis=payload["pre_op_diagnosis"],
        post_op_diagnosis=payload["post_op_diagnosis"],
        findings=payload["findings"],
        complications=payload["complications"],
        post_op_instructions=payload["post_op_instructions"],
        prescriptions=[PrescriptionItem.model_validate(item) for item in payload["prescriptions"]],
        follow_up=payload["follow_up"],
        notes=payload.get("notes"),
    )
