from pydantic import BaseModel, EmailStr, Field

from app.schemas.patient import PatientDetail


class DoctorProfileResponse(BaseModel):
    id: str
    name: str
    specialty: str
    email: EmailStr
    phone: str
    bio: str


class DoctorProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    specialty: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=50)
    bio: str = Field(min_length=20, max_length=2000)


class PatientProfileResponse(PatientDetail):
    pass
