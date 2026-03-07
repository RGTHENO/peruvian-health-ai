from fastapi import APIRouter

from app.api.v1.endpoints import (
    appointments,
    auth,
    directory,
    doctors,
    encounters,
    meta,
    notifications,
    patients,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(directory.router)
api_router.include_router(doctors.router)
api_router.include_router(appointments.router)
api_router.include_router(patients.router)
api_router.include_router(encounters.router)
api_router.include_router(notifications.router)
api_router.include_router(meta.router)
