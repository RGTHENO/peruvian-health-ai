from typing import Literal

from pydantic import BaseModel, Field

AppointmentTypeValue = Literal["presencial", "telemedicina"]
AppointmentStatusValue = Literal["confirmada", "en-espera", "cancelada", "completada"]


class AppointmentSummary(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    date: str
    time: str
    duration: int
    type: AppointmentTypeValue
    status: AppointmentStatusValue
    reason: str
    notes: str | None = None


class AppointmentCreateRequest(BaseModel):
    doctor_id: str
    patient_id: str
    date: str
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    duration: int = Field(default=30, ge=15, le=180)
    type: AppointmentTypeValue
    reason: str = Field(min_length=3, max_length=500)
    notes: str | None = Field(default=None, max_length=1000)


class AppointmentStatusUpdateRequest(BaseModel):
    status: AppointmentStatusValue
