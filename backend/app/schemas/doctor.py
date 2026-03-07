from typing import Literal

from pydantic import BaseModel


class DoctorSummary(BaseModel):
    id: str
    name: str
    specialty: str
    rating: float
    reviews: int
    price: int
    location: str
    distance: str
    available: bool
    modality: list[Literal["presencial", "telemedicina"]]
    insurance: list[str]
    languages: list[str]
    bio: str
    experience: int
    avatar: str


class DoctorAvailabilitySlot(BaseModel):
    date: str
    slots: list[str]


class DirectoryResponse(BaseModel):
    total: int
    doctors: list[DoctorSummary]
