from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.user import User
from app.repositories.encounters import list_encounters_for_patient
from app.repositories.patients import get_patient, get_patient_by_user_id
from app.services.serializers import serialize_encounter


def get_patient_history_for_self(db: Session, user: User):
    patient = get_patient_by_user_id(db, user.id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de paciente no encontrado"
        )
    return [
        serialize_encounter(encounter) for encounter in list_encounters_for_patient(db, patient.id)
    ]


def get_patient_history(db: Session, patient_id: str):
    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")
    return [
        serialize_encounter(encounter) for encounter in list_encounters_for_patient(db, patient_id)
    ]
