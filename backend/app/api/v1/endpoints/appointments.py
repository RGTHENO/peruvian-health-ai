from fastapi import APIRouter

from app.api.deps import CurrentUserDep, DoctorUserDep, PatientUserDep, SessionDep
from app.db.models.appointment import AppointmentStatus
from app.schemas.appointment import AppointmentCreateRequest, AppointmentStatusUpdateRequest
from app.services.appointments import (
    create_new_appointment,
    list_user_appointments,
    update_appointment_status,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("")
def appointments(db: SessionDep, current_user: CurrentUserDep):
    return list_user_appointments(db, current_user)


@router.post("")
def create_appointment(payload: AppointmentCreateRequest, db: SessionDep, current_user: PatientUserDep):
    return create_new_appointment(db, payload, current_user)


@router.patch("/{appointment_id}")
def patch_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdateRequest,
    db: SessionDep,
    current_user: DoctorUserDep,
):
    return update_appointment_status(db, appointment_id, payload.status, current_user)


@router.post("/{appointment_id}/confirm")
def confirm_appointment(appointment_id: str, db: SessionDep, current_user: DoctorUserDep):
    return update_appointment_status(db, appointment_id, AppointmentStatus.CONFIRMED.value, current_user)


@router.post("/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str, db: SessionDep, current_user: DoctorUserDep):
    return update_appointment_status(db, appointment_id, AppointmentStatus.CANCELLED.value, current_user)


@router.post("/{appointment_id}/complete")
def complete_appointment(appointment_id: str, db: SessionDep, current_user: DoctorUserDep):
    return update_appointment_status(db, appointment_id, AppointmentStatus.COMPLETED.value, current_user)
