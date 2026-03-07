from typing import Annotated, Literal

from pydantic import BaseModel, Field


class PrescriptionItem(BaseModel):
    medication: str
    dosage: str
    frequency: str
    duration: str


class LabResultItem(BaseModel):
    test: str
    result: str
    reference_range: str
    unit: str
    status: Literal["Normal", "Anormal"]


class ConsultationEncounterResponse(BaseModel):
    type: Literal["consultation"]
    patient_id: str
    date: str
    doctor: str
    specialty: str
    diagnosis: str
    diagnosis_status: Literal["Activo", "Resuelto"]
    prescriptions: list[PrescriptionItem]
    recommendations: list[str]
    lab_orders: list[str]
    notes: str | None = None


class LabEncounterResponse(BaseModel):
    type: Literal["lab"]
    patient_id: str
    date: str
    lab: str
    ordered_by: str
    lab_results: list[LabResultItem]


class SurgeryEncounterResponse(BaseModel):
    type: Literal["surgery"]
    patient_id: str
    date: str
    surgeon: str
    specialty: str
    hospital: str
    procedure: str
    procedure_type: Literal["Electiva", "Emergencia", "Ambulatoria"]
    anesthesia_type: str
    duration: str
    pre_op_diagnosis: str
    post_op_diagnosis: str
    findings: list[str]
    complications: list[str]
    post_op_instructions: list[str]
    prescriptions: list[PrescriptionItem]
    follow_up: str
    notes: str | None = None


EncounterResponse = Annotated[
    ConsultationEncounterResponse | LabEncounterResponse | SurgeryEncounterResponse,
    Field(discriminator="type"),
]


class ConsultationSurgeryReferral(BaseModel):
    procedure: str
    urgency: Literal["Electiva", "Urgente"]
    notes: str = ""


class ConsultationCreateRequest(BaseModel):
    appointment_id: str | None = None
    chief_complaint: str = ""
    symptoms: str = ""
    physical_exam: str = ""
    diagnosis: str = Field(min_length=3, max_length=500)
    diagnosis_status: Literal["Activo", "Resuelto"] = "Activo"
    prescriptions: list[PrescriptionItem] = []
    recommendations: list[str] = []
    lab_orders: list[str] = []
    surgery_referral: ConsultationSurgeryReferral | None = None
    notes: str = ""


class LabEncounterCreateRequest(BaseModel):
    appointment_id: str | None = None
    lab: str
    ordered_by: str
    lab_results: list[LabResultItem]


class SurgeryEncounterCreateRequest(BaseModel):
    appointment_id: str | None = None
    surgeon: str
    specialty: str
    hospital: str
    procedure: str
    procedure_type: Literal["Electiva", "Emergencia", "Ambulatoria"]
    anesthesia_type: str
    duration: str
    pre_op_diagnosis: str
    post_op_diagnosis: str
    findings: list[str] = []
    complications: list[str] = []
    post_op_instructions: list[str] = []
    prescriptions: list[PrescriptionItem] = []
    follow_up: str
    notes: str | None = None
