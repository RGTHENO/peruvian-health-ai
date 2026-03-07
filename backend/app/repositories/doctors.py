from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.doctor import DoctorProfile


def list_doctors(db: Session) -> list[DoctorProfile]:
    return list(db.scalars(select(DoctorProfile).order_by(DoctorProfile.name)))


def get_doctor(db: Session, doctor_id: str) -> DoctorProfile | None:
    return db.scalar(select(DoctorProfile).where(DoctorProfile.id == doctor_id))


def get_doctor_by_user_id(db: Session, user_id: str) -> DoctorProfile | None:
    return db.scalar(select(DoctorProfile).where(DoctorProfile.user_id == user_id))
