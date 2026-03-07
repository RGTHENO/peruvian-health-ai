from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.scalar(select(User).where(User.id == user_id))


def get_refresh_token(db: Session, token_id: str) -> RefreshToken | None:
    return db.scalar(select(RefreshToken).where(RefreshToken.id == token_id))


def save_refresh_token(db: Session, refresh_token: RefreshToken) -> None:
    db.add(refresh_token)
    db.commit()


def revoke_refresh_token(db: Session, refresh_token: RefreshToken) -> None:
    refresh_token.revoked_at = datetime.now(UTC)
    db.add(refresh_token)
    db.commit()
