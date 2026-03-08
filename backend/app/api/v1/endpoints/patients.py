from fastapi import APIRouter

from app.api.deps import DoctorUserDep, PatientUserDep, SessionDep
from app.schemas.profile import PatientProfileResponse
from app.services.history import get_patient_history, get_patient_history_for_self
from app.services.profile import get_patient_self_profile

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/me/history")
def my_history(db: SessionDep, current_user: PatientUserDep):
    return get_patient_history_for_self(db, current_user)


@router.get("/me/profile", response_model=PatientProfileResponse)
def my_profile(db: SessionDep, current_user: PatientUserDep):
    return get_patient_self_profile(db, current_user)


@router.get("/{patient_id}/history")
def patient_history(db: SessionDep, current_user: DoctorUserDep, patient_id: str):
    return get_patient_history(db, patient_id)
