from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import TokenType, decode_token
from app.db.models.user import User, UserRole
from app.db.session import get_db
from app.repositories.auth import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(db: SessionDep, token: TokenDep) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
    except Exception as exc:  # pragma: no cover - jwt internals
        raise credentials_exception from exc
    if payload.get("type") != TokenType.ACCESS.value:
        raise credentials_exception
    user = get_user_by_id(db, str(payload.get("sub")))
    if not user or not user.is_active:
        raise credentials_exception
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def require_doctor(user: CurrentUserDep) -> User:
    if user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Acceso exclusivo para médicos"
        )
    return user


def require_patient(user: CurrentUserDep) -> User:
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Acceso exclusivo para pacientes"
        )
    return user


DoctorUserDep = Annotated[User, Depends(require_doctor)]
PatientUserDep = Annotated[User, Depends(require_patient)]
