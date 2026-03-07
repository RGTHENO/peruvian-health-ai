from fastapi import APIRouter

from app.api.deps import DoctorUserDep, SessionDep
from app.schemas.encounter import (
    ConsultationCreateRequest,
    LabEncounterCreateRequest,
    SurgeryEncounterCreateRequest,
)
from app.services.encounters import (
    create_consultation_encounter,
    create_lab_encounter,
    create_surgery_encounter,
)

router = APIRouter(prefix="/patients/{patient_id}/encounters", tags=["encounters"])


@router.post("/consultations")
def create_consultation(
    patient_id: str,
    payload: ConsultationCreateRequest,
    db: SessionDep,
    current_user: DoctorUserDep,
):
    return create_consultation_encounter(db, current_user, patient_id, payload)


@router.post("/labs")
def create_lab(
    patient_id: str,
    payload: LabEncounterCreateRequest,
    db: SessionDep,
    current_user: DoctorUserDep,
):
    return create_lab_encounter(db, current_user, patient_id, payload)


@router.post("/procedures")
def create_procedure(
    patient_id: str,
    payload: SurgeryEncounterCreateRequest,
    db: SessionDep,
    current_user: DoctorUserDep,
):
    return create_surgery_encounter(db, current_user, patient_id, payload)
