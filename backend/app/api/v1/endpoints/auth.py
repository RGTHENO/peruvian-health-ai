import jwt
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, SessionDep
from app.core.security import TokenType, decode_token
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    TokenPairResponse,
)
from app.services.auth import (
    authenticate_user,
    change_password,
    logout_session,
    refresh_session,
    serialize_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenPairResponse)
def login(payload: LoginRequest, db: SessionDep) -> TokenPairResponse:
    return authenticate_user(db, payload.email, payload.password, payload.role)


@router.post("/refresh", response_model=TokenPairResponse)
def refresh(payload: RefreshRequest, db: SessionDep) -> TokenPairResponse:
    try:
        token_data = decode_token(payload.refresh_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        ) from exc
    if token_data.get("type") != TokenType.REFRESH.value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        )
    return refresh_session(db, str(token_data["sub"]), str(token_data["jti"]))


@router.get("/me")
def me(current_user: CurrentUserDep):
    return serialize_user(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: LogoutRequest, db: SessionDep):
    logout_session(db, payload.refresh_token)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(payload: ChangePasswordRequest, db: SessionDep, current_user: CurrentUserDep):
    change_password(db, current_user, payload.current_password, payload.new_password)
