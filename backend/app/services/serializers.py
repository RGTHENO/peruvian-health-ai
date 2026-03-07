from datetime import date, time

from app.db.models.appointment import Appointment
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
    return AppointmentSummary(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=appointment.patient.name,
        doctor_id=appointment.doctor_id,
        doctor_name=appointment.doctor.name,
        date=format_date(appointment.date),
        time=format_time(appointment.time),
        duration=appointment.duration,
        type=appointment.type.value,
        status=appointment.status.value,
        reason=appointment.reason,
        notes=appointment.notes,
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
