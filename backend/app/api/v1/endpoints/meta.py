from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/version")
def version():
    settings = get_settings()
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }
