from pydantic import BaseModel

from app.schemas.appointment import AppointmentSummary
from app.schemas.patient import PatientDetail, PatientSummary


class DashboardCounts(BaseModel):
    citas_hoy: int
    confirmadas: int
    en_espera: int
    canceladas: int
    total_pacientes: int


class DoctorDashboardResponse(BaseModel):
    active_date: str
    active_date_label: str
    counts: DashboardCounts
    upcoming_today: list[AppointmentSummary]
    recent_patients: list[PatientSummary]


class DoctorPatientRecordResponse(BaseModel):
    patient: PatientDetail
    upcoming_appointments: list[AppointmentSummary]
    encounters: list[object]
