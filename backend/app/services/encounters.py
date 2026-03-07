from datetime import date
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.appointment import AppointmentStatus
from app.db.models.encounter import Encounter, EncounterKind
from app.db.models.user import User
from app.repositories.appointments import get_appointment
from app.repositories.doctors import get_doctor_by_user_id
from app.repositories.encounters import create_encounter
from app.repositories.patients import get_patient
from app.schemas.encounter import (
    ConsultationCreateRequest,
    LabEncounterCreateRequest,
    SurgeryEncounterCreateRequest,
)
from app.services.serializers import serialize_encounter


def _assert_doctor_access(db: Session, user: User):
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )
    return doctor


def create_consultation_encounter(
    db: Session, user: User, patient_id: str, payload: ConsultationCreateRequest
):
    doctor = _assert_doctor_access(db, user)
    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")

    appointment = None
    if payload.appointment_id:
        appointment = get_appointment(db, payload.appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")

    notes = "\n".join(
        part
        for part in [
            f"Motivo: {payload.chief_complaint}" if payload.chief_complaint else "",
            f"Síntomas: {payload.symptoms}" if payload.symptoms else "",
            f"Examen físico: {payload.physical_exam}" if payload.physical_exam else "",
            payload.notes,
        ]
        if part
    )

    consultation = Encounter(
        id=f"enc-{uuid4()}",
        patient_id=patient_id,
        doctor_id=doctor.id,
        appointment_id=appointment.id if appointment else None,
        kind=EncounterKind.CONSULTATION,
        occurred_on=date.today(),
        actor_name=doctor.name,
        specialty=doctor.specialty,
        payload={
            "diagnosis": payload.diagnosis,
            "diagnosis_status": payload.diagnosis_status,
            "prescriptions": [
                item.model_dump() for item in payload.prescriptions if item.medication.strip()
            ],
            "recommendations": [item.strip() for item in payload.recommendations if item.strip()],
            "lab_orders": [item.strip() for item in payload.lab_orders if item.strip()],
            "notes": notes or None,
        },
    )
    consultation = create_encounter(db, consultation)

    if appointment:
        appointment.status = AppointmentStatus.COMPLETED
        db.add(appointment)
        db.commit()

    if payload.lab_orders:
        create_encounter(
            db,
            Encounter(
                id=f"enc-{uuid4()}",
                patient_id=patient_id,
                doctor_id=doctor.id,
                appointment_id=appointment.id if appointment else None,
                kind=EncounterKind.LAB,
                occurred_on=date.today(),
                actor_name="Pendiente",
                specialty=doctor.specialty,
                payload={
                    "ordered_by": doctor.name,
                    "lab_results": [
                        {
                            "test": item,
                            "result": "Pendiente",
                            "reference_range": "—",
                            "unit": "—",
                            "status": "Normal",
                        }
                        for item in payload.lab_orders
                        if item.strip()
                    ],
                },
            ),
        )

    if payload.surgery_referral and payload.surgery_referral.procedure.strip():
        create_encounter(
            db,
            Encounter(
                id=f"enc-{uuid4()}",
                patient_id=patient_id,
                doctor_id=doctor.id,
                appointment_id=appointment.id if appointment else None,
                kind=EncounterKind.SURGERY,
                occurred_on=date.today(),
                actor_name="Por asignar",
                specialty="Cirugía General",
                payload={
                    "hospital": "Por confirmar",
                    "procedure": payload.surgery_referral.procedure.strip(),
                    "procedure_type": "Emergencia"
                    if payload.surgery_referral.urgency == "Urgente"
                    else "Electiva",
                    "anesthesia_type": "Pendiente",
                    "duration": "Pendiente",
                    "pre_op_diagnosis": payload.diagnosis,
                    "post_op_diagnosis": payload.diagnosis,
                    "findings": [],
                    "complications": [],
                    "post_op_instructions": [payload.surgery_referral.notes]
                    if payload.surgery_referral.notes.strip()
                    else [],
                    "prescriptions": [],
                    "follow_up": "Programar evaluación quirúrgica",
                    "notes": payload.surgery_referral.notes or None,
                },
            ),
        )

    return serialize_encounter(consultation)


def create_lab_encounter(
    db: Session, user: User, patient_id: str, payload: LabEncounterCreateRequest
):
    doctor = _assert_doctor_access(db, user)
    if not get_patient(db, patient_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")
    encounter = create_encounter(
        db,
        Encounter(
            id=f"enc-{uuid4()}",
            patient_id=patient_id,
            doctor_id=doctor.id,
            appointment_id=payload.appointment_id,
            kind=EncounterKind.LAB,
            occurred_on=date.today(),
            actor_name=payload.lab,
            specialty=doctor.specialty,
            payload={
                "ordered_by": payload.ordered_by,
                "lab_results": [item.model_dump() for item in payload.lab_results],
            },
        ),
    )
    return serialize_encounter(encounter)


def create_surgery_encounter(
    db: Session, user: User, patient_id: str, payload: SurgeryEncounterCreateRequest
):
    doctor = _assert_doctor_access(db, user)
    if not get_patient(db, patient_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")
    encounter = create_encounter(
        db,
        Encounter(
            id=f"enc-{uuid4()}",
            patient_id=patient_id,
            doctor_id=doctor.id,
            appointment_id=payload.appointment_id,
            kind=EncounterKind.SURGERY,
            occurred_on=date.today(),
            actor_name=payload.surgeon,
            specialty=payload.specialty,
            payload={
                "hospital": payload.hospital,
                "procedure": payload.procedure,
                "procedure_type": payload.procedure_type,
                "anesthesia_type": payload.anesthesia_type,
                "duration": payload.duration,
                "pre_op_diagnosis": payload.pre_op_diagnosis,
                "post_op_diagnosis": payload.post_op_diagnosis,
                "findings": payload.findings,
                "complications": payload.complications,
                "post_op_instructions": payload.post_op_instructions,
                "prescriptions": [item.model_dump() for item in payload.prescriptions],
                "follow_up": payload.follow_up,
                "notes": payload.notes,
            },
        ),
    )
    return serialize_encounter(encounter)
