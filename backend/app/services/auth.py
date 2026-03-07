from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import TokenType, create_token, decode_token, hash_password, verify_password
from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User
from app.repositories.auth import (
    get_refresh_token,
    get_user_by_email,
    get_user_by_id,
    revoke_refresh_token,
    save_refresh_token,
)
from app.schemas.auth import AuthUser, TokenPairResponse


def serialize_user(user: User) -> AuthUser:
    return AuthUser(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        doctor_id=user.doctor_profile.id if user.doctor_profile else None,
        patient_id=user.patient_profile.id if user.patient_profile else None,
    )


def create_session_tokens(db: Session, user: User) -> TokenPairResponse:
    settings = get_settings()
    access_token, _, _ = create_token(
        subject=user.id,
        role=user.role.value,
        token_type=TokenType.ACCESS,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token, refresh_jti, refresh_expires_at = create_token(
        subject=user.id,
        role=user.role.value,
        token_type=TokenType.REFRESH,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )
    save_refresh_token(
        db,
        RefreshToken(id=refresh_jti, user_id=user.id, expires_at=refresh_expires_at),
    )
    return TokenPairResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=serialize_user(user),
    )


def authenticate_user(
    db: Session, email: str, password: str, role: str | None
) -> TokenPairResponse:
    user = get_user_by_email(db, email.lower())
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas"
        )
    if role and user.role.value != role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Rol no autorizado")
    return create_session_tokens(db, user)


def refresh_session(db: Session, user_id: str, refresh_jti: str) -> TokenPairResponse:
    refresh_token = get_refresh_token(db, refresh_jti)
    if (
        not refresh_token
        or refresh_token.user_id != user_id
        or refresh_token.revoked_at is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        )

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado"
        )
    revoke_refresh_token(db, refresh_token)
    return create_session_tokens(db, user)


def logout_session(db: Session, refresh_token_value: str) -> None:
    try:
        token_data = decode_token(refresh_token_value)
    except Exception as exc:  # pragma: no cover - jwt internals
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        ) from exc

    if token_data.get("type") != TokenType.REFRESH.value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        )

    refresh_token = get_refresh_token(db, str(token_data["jti"]))
    if not refresh_token or refresh_token.user_id != str(token_data["sub"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido"
        )

    if refresh_token.revoked_at is None:
        revoke_refresh_token(db, refresh_token)


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="La contraseña actual es incorrecta"
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe ser distinta a la actual",
        )

    user.password_hash = hash_password(new_password)
    db.add(user)
    db.commit()
