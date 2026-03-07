from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.user import User
from app.repositories.auth import get_user_by_email
from app.repositories.doctors import get_doctor_by_user_id
from app.repositories.patients import get_patient_by_user_id
from app.schemas.profile import (
    DoctorProfileResponse,
    DoctorProfileUpdateRequest,
    PatientProfileResponse,
)
from app.services.serializers import serialize_patient_detail


def get_doctor_profile(db: Session, user: User) -> DoctorProfileResponse:
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    return DoctorProfileResponse(
        id=doctor.id,
        name=doctor.name,
        specialty=doctor.specialty,
        email=user.email,
        phone=doctor.phone,
        bio=doctor.bio,
    )


def update_doctor_profile(
    db: Session, user: User, payload: DoctorProfileUpdateRequest
) -> DoctorProfileResponse:
    doctor = get_doctor_by_user_id(db, user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil médico no encontrado"
        )

    existing_user = get_user_by_email(db, payload.email.lower())
    if existing_user and existing_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="El correo ya está en uso"
        )

    user.email = payload.email.lower()
    user.full_name = payload.name
    doctor.name = payload.name
    doctor.specialty = payload.specialty
    doctor.phone = payload.phone
    doctor.bio = payload.bio

    db.add(user)
    db.add(doctor)
    db.commit()
    db.refresh(user)
    db.refresh(doctor)

    return get_doctor_profile(db, user)


def get_patient_self_profile(db: Session, user: User) -> PatientProfileResponse:
    patient = get_patient_by_user_id(db, user.id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de paciente no encontrado"
        )

    return PatientProfileResponse(**serialize_patient_detail(patient).model_dump())
