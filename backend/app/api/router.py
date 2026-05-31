from fastapi import APIRouter

from app.modules.issues.router import router as issues_router
from app.modules.water_management.router import router as water_management_router
from app.modules.workers.router import router as workers_router


api_router = APIRouter()
api_router.include_router(issues_router)
api_router.include_router(water_management_router)
api_router.include_router(workers_router)
