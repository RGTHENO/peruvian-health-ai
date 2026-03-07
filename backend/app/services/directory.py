from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.doctors import get_doctor, list_doctors
from app.schemas.doctor import DirectoryResponse, DoctorAvailabilitySlot
from app.services.serializers import serialize_doctor


def search_doctors(
    db: Session,
    *,
    q: str | None = None,
    especialidad: str | None = None,
    seguro: str | None = None,
    modalidad: str | None = None,
) -> DirectoryResponse:
    doctors = list_doctors(db)
    query = (q or "").strip().lower()

    filtered = []
    for doctor in doctors:
        if query and query not in doctor.name.lower() and query not in doctor.specialty.lower():
            continue
        if especialidad and doctor.specialty != especialidad:
            continue
        if seguro and seguro not in doctor.insurances:
            continue
        if modalidad and modalidad not in doctor.modalities:
            continue
        filtered.append(serialize_doctor(doctor))

    return DirectoryResponse(total=len(filtered), doctors=filtered)


def get_doctor_detail(db: Session, doctor_id: str):
    doctor = get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor no encontrado")
    return serialize_doctor(doctor)


def get_doctor_availability(db: Session, doctor_id: str) -> list[DoctorAvailabilitySlot]:
    doctor = get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor no encontrado")

    if not doctor.available:
        return []

    today = date.today()
    base_slots = ["09:00", "10:00", "11:00", "16:00"]
    return [
        DoctorAvailabilitySlot(date=(today + timedelta(days=index)).isoformat(), slots=base_slots)
        for index in range(1, 6)
    ]
