from fastapi import APIRouter, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    PatientRegistrationRequest,
    RefreshRequest,
    TokenPairResponse,
)
from app.services.auth import (
    authenticate_user,
    change_password,
    decode_refresh_token,
    logout_session,
    refresh_session,
    register_patient,
    serialize_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenPairResponse)
@limiter.limit("10/minute")
def login(payload: LoginRequest, db: SessionDep, request: Request) -> TokenPairResponse:
    return authenticate_user(db, payload.email, payload.password, payload.role)


@router.post("/register/patient", response_model=TokenPairResponse)
@limiter.limit("5/minute")
def register(payload: PatientRegistrationRequest, db: SessionDep, request: Request) -> TokenPairResponse:
    return register_patient(db, payload)


@router.post("/refresh", response_model=TokenPairResponse)
@limiter.limit("20/minute")
def refresh(payload: RefreshRequest, db: SessionDep, request: Request) -> TokenPairResponse:
    token_data = decode_refresh_token(payload.refresh_token)
    return refresh_session(db, str(token_data["sub"]), str(token_data["jti"]))


@router.get("/me")
def me(current_user: CurrentUserDep):
    return serialize_user(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: LogoutRequest, db: SessionDep, current_user: CurrentUserDep):
    logout_session(db, payload.refresh_token)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(payload: ChangePasswordRequest, db: SessionDep, current_user: CurrentUserDep):
    change_password(db, current_user, payload.current_password, payload.new_password)
