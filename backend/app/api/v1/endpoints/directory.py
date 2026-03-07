from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.schemas.doctor import DirectoryResponse
from app.services.directory import search_doctors

router = APIRouter(prefix="/directory", tags=["directory"])


@router.get("/doctors", response_model=DirectoryResponse)
def list_directory_doctors(
    db: SessionDep,
    q: Annotated[str | None, Query(max_length=100)] = None,
    especialidad: Annotated[str | None, Query(max_length=120)] = None,
    seguro: Annotated[str | None, Query(max_length=120)] = None,
    modalidad: Annotated[str | None, Query(max_length=20)] = None,
) -> DirectoryResponse:
    return search_doctors(db, q=q, especialidad=especialidad, seguro=seguro, modalidad=modalidad)
