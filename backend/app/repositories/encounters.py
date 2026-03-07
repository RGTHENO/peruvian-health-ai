from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.encounter import Encounter


def list_encounters_for_patient(db: Session, patient_id: str) -> list[Encounter]:
    return list(
        db.scalars(
            select(Encounter)
            .where(Encounter.patient_id == patient_id)
            .order_by(Encounter.occurred_on.desc(), Encounter.created_at.desc())
        )
    )


def create_encounter(db: Session, encounter: Encounter) -> Encounter:
    db.add(encounter)
    db.commit()
    db.refresh(encounter)
    return encounter
