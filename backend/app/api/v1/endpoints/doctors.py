from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DoctorUserDep, SessionDep
from app.schemas.profile import DoctorProfileResponse, DoctorProfileUpdateRequest
from app.services.directory import get_doctor_availability, get_doctor_detail
from app.services.doctor_portal import (
    get_doctor_agenda,
    get_doctor_dashboard,
    get_doctor_patient_record,
    get_doctor_patients,
)
from app.services.profile import get_doctor_profile, update_doctor_profile

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("/me/dashboard")
def doctor_dashboard(db: SessionDep, current_user: DoctorUserDep):
    return get_doctor_dashboard(db, current_user)


@router.get("/me/profile", response_model=DoctorProfileResponse)
def doctor_profile(db: SessionDep, current_user: DoctorUserDep):
    return get_doctor_profile(db, current_user)


@router.patch("/me/profile", response_model=DoctorProfileResponse)
def patch_doctor_profile(
    payload: DoctorProfileUpdateRequest, db: SessionDep, current_user: DoctorUserDep
):
    return update_doctor_profile(db, current_user, payload)


@router.get("/me/agenda")
def doctor_agenda(
    db: SessionDep,
    current_user: DoctorUserDep,
    date: Annotated[str | None, Query(pattern=r"^\d{4}-\d{2}-\d{2}$")] = None,
):
    return get_doctor_agenda(db, current_user, date)


@router.get("/me/patients")
def doctor_patients(
    db: SessionDep,
    current_user: DoctorUserDep,
    search: Annotated[str | None, Query(max_length=100)] = None,
):
    return get_doctor_patients(db, current_user, search)


@router.get("/me/patients/{patient_id}")
def doctor_patient_record(db: SessionDep, current_user: DoctorUserDep, patient_id: str):
    return get_doctor_patient_record(db, current_user, patient_id)


@router.get("/{doctor_id}")
def doctor_detail(db: SessionDep, doctor_id: str):
    return get_doctor_detail(db, doctor_id)


@router.get("/{doctor_id}/availability")
def doctor_availability(db: SessionDep, doctor_id: str):
    return get_doctor_availability(db, doctor_id)
