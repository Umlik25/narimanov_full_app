from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db_session
from app.dependencies.redis import get_redis_client
from app.modules.workers.repository import WorkerLocationRepository, WorkerRepository
from app.modules.workers.schemas import (
    WorkerCreate,
    WorkerListResponse,
    WorkerLocationResponse,
    WorkerLocationUpdate,
    WorkerResponse,
    WorkerUpdate,
    WorkerWindowResponse,
)
from app.modules.workers.service import WorkerService, WorkerWindowService
router = APIRouter(prefix="/workers", tags=["Workers"])


def get_worker_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> WorkerService:
    repository = WorkerRepository(session)
    location_repository = WorkerLocationRepository(redis)
    return WorkerService(repository, location_repository)


def get_worker_window_service(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> WorkerWindowService:
    location_repository = WorkerLocationRepository(redis)
    return WorkerWindowService(location_repository)


@router.post(
    "",
    response_model=WorkerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create worker",
)
async def create_worker(
    payload: WorkerCreate,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> WorkerResponse:
    worker = await service.create_worker(payload)
    return WorkerResponse.model_validate(worker)


@router.get(
    "",
    response_model=WorkerListResponse,
    summary="List workers",
)
async def list_workers(
    service: Annotated[WorkerService, Depends(get_worker_service)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> WorkerListResponse:
    workers, total = await service.list_workers(limit=limit, offset=offset)
    return WorkerListResponse(
        items=[WorkerResponse.model_validate(worker) for worker in workers],
        limit=limit,
        offset=offset,
        total=total,
    )


@router.get(
    "/locations",
    response_model=list[WorkerLocationResponse],
    summary="List current worker locations",
)
async def list_worker_locations(
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> list[WorkerLocationResponse]:
    return await service.list_worker_locations()


@router.get(
    "/window",
    response_model=WorkerWindowResponse,
    summary="List workers in coordinate window",
)
async def list_workers_in_window(
    service: Annotated[WorkerWindowService, Depends(get_worker_window_service)],
    min_lat: Annotated[float, Query(ge=-90, le=90)],
    min_lon: Annotated[float, Query(ge=-180, le=180)],
    max_lat: Annotated[float, Query(ge=-90, le=90)],
    max_lon: Annotated[float, Query(ge=-180, le=180)],
) -> WorkerWindowResponse:
    if min_lat > max_lat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_lat must be less than or equal to max_lat",
        )

    if min_lon > max_lon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_lon must be less than or equal to max_lon",
        )

    locations = await service.list_workers_in_window(
        min_lat=min_lat,
        min_lon=min_lon,
        max_lat=max_lat,
        max_lon=max_lon,
    )
    return WorkerWindowResponse(items=locations, total=len(locations))


@router.get(
    "/{worker_id}",
    response_model=WorkerResponse,
    summary="Get worker",
)
async def get_worker(
    worker_id: int,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> WorkerResponse:
    worker = await service.get_worker(worker_id)
    return WorkerResponse.model_validate(worker)


@router.patch(
    "/{worker_id}",
    response_model=WorkerResponse,
    summary="Update worker",
)
async def update_worker(
    worker_id: int,
    payload: WorkerUpdate,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> WorkerResponse:
    worker = await service.update_worker(worker_id, payload)
    return WorkerResponse.model_validate(worker)


@router.delete(
    "/{worker_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete worker",
)
async def delete_worker(
    worker_id: int,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> Response:
    await service.delete_worker(worker_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put(
    "/{worker_id}/location",
    response_model=WorkerLocationResponse,
    summary="Update worker location",
)
async def update_worker_location(
    worker_id: int,
    payload: WorkerLocationUpdate,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> WorkerLocationResponse:
    return await service.update_worker_location(worker_id, payload)


@router.get(
    "/{worker_id}/location",
    response_model=WorkerLocationResponse,
    summary="Get worker location",
)
async def get_worker_location(
    worker_id: int,
    service: Annotated[WorkerService, Depends(get_worker_service)],
) -> WorkerLocationResponse:
    return await service.get_worker_location(worker_id)
