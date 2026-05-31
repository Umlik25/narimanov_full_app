from app.core.exceptions import NotFoundError
from app.modules.workers.models import Worker
from app.modules.workers.repository import WorkerLocationRepository, WorkerRepository
from app.modules.workers.schemas import (
    WorkerCreate,
    WorkerLocationResponse,
    WorkerLocationUpdate,
    WorkerUpdate,
    WorkerWindowItemResponse,
)


class WorkerService:
    def __init__(
        self,
        repository: WorkerRepository,
        location_repository: WorkerLocationRepository,
    ) -> None:
        self.repository = repository
        self.location_repository = location_repository

    async def create_worker(self, payload: WorkerCreate) -> Worker:
        return await self.repository.create(payload.model_dump(mode="json"))

    async def get_worker(self, worker_id: int) -> Worker:
        worker = await self.repository.get_by_id(worker_id)
        if worker is None:
            raise NotFoundError(f"Worker {worker_id} not found")
        return worker

    async def list_workers(self, limit: int, offset: int) -> tuple[list[Worker], int]:
        return await self.repository.list(limit=limit, offset=offset)

    async def update_worker(self, worker_id: int, payload: WorkerUpdate) -> Worker:
        worker = await self.get_worker(worker_id)
        update_data = payload.model_dump(exclude_unset=True, mode="json")
        return await self.repository.update(worker, update_data)

    async def delete_worker(self, worker_id: int) -> None:
        deleted = await self.repository.delete(worker_id)
        if not deleted:
            raise NotFoundError(f"Worker {worker_id} not found")
        await self.location_repository.delete_location(worker_id)

    async def update_worker_location(
        self,
        worker_id: int,
        payload: WorkerLocationUpdate,
    ) -> WorkerLocationResponse:
        await self.get_worker(worker_id)
        return await self.location_repository.set_location(
            worker_id=worker_id,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )

    async def get_worker_location(self, worker_id: int) -> WorkerLocationResponse:
        await self.get_worker(worker_id)
        location = await self.location_repository.get_location(worker_id)
        if location is None:
            raise NotFoundError(f"Location for worker {worker_id} not found")
        return location

    async def list_worker_locations(self) -> list[WorkerLocationResponse]:
        return await self.location_repository.list_locations()


class WorkerWindowService:
    def __init__(self, location_repository: WorkerLocationRepository) -> None:
        self.location_repository = location_repository

    async def list_workers_in_window(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
    ) -> list[WorkerWindowItemResponse]:
        return await self.location_repository.list_locations_in_window(
            min_latitude=min_lat,
            min_longitude=min_lon,
            max_latitude=max_lat,
            max_longitude=max_lon,
        )
