from pydantic import BaseModel


class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str


class PatientSummary(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: str
    email: str
    insurance: str
    last_visit: str | None = None
    conditions: list[str]
    avatar: str
    blood_type: str | None = None


class PatientDetail(PatientSummary):
    allergies: list[str]
    emergency_contact: EmergencyContact | None = None
