from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role: Literal["patient", "doctor", "admin"] | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=100)
    new_password: str = Field(min_length=8, max_length=100)


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
