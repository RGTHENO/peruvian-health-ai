from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.patient import PatientProfile


def list_patients(db: Session) -> list[PatientProfile]:
    return list(db.scalars(select(PatientProfile).order_by(PatientProfile.name)))


def get_patient(db: Session, patient_id: str) -> PatientProfile | None:
    return db.scalar(select(PatientProfile).where(PatientProfile.id == patient_id))


def get_patient_by_user_id(db: Session, user_id: str) -> PatientProfile | None:
    return db.scalar(select(PatientProfile).where(PatientProfile.user_id == user_id))


def get_patient_by_email(db: Session, email: str) -> PatientProfile | None:
    return db.scalar(select(PatientProfile).where(PatientProfile.email == email))
