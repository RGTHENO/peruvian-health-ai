import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

PatientGender = Literal["M", "F"]

_PASSWORD_PATTERN = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:'\",.<>?/\\`~]).{8,100}$"
)
_PASSWORD_ERROR = (
    "La contraseña debe tener al menos una mayúscula, una minúscula, un número "
    "y un carácter especial"
)


def _validate_password_complexity(v: str) -> str:
    if not _PASSWORD_PATTERN.match(v):
        raise ValueError(_PASSWORD_ERROR)
    return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    role: Literal["patient", "doctor", "admin"] | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


RefreshRequest = RefreshTokenRequest
LogoutRequest = RefreshTokenRequest


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=100)
    new_password: str = Field(min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _validate_password_complexity(v)


class PatientRegistrationRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password_complexity(v)
    phone: str = Field(min_length=7, max_length=50)
    age: int = Field(ge=0, le=120)
    gender: PatientGender
    insurance: str = Field(default="Particular", min_length=2, max_length=120)
    telegram_handle: str | None = Field(default=None, max_length=120)

    @field_validator("full_name", "phone", "insurance")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("telegram_handle")
    @classmethod
    def normalize_telegram(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip().lstrip("@")
        return cleaned or None


class AuthUser(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: Literal["patient", "doctor", "admin"]
    doctor_id: str | None = None
    patient_id: str | None = None


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AuthUser
