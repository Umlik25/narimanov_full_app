from datetime import UTC, datetime
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase

from app.core.exceptions import NotFoundError
from app.modules.workers.models import WorkerStatus
from app.modules.workers.repository import (
    WorkerLocationRepository,
)
from app.modules.workers.schemas import (
    WorkerCreate,
    WorkerLocationResponse,
    WorkerLocationUpdate,
    WorkerWindowItemResponse,
)
from app.modules.workers.service import WorkerService, WorkerWindowService
from app.modules.workers.utils import calculate_bearing_degrees


class FakeWorkerRepository:
    def __init__(self) -> None:
        self.workers: dict[int, SimpleNamespace] = {}
        self.created_payloads: list[dict[str, object]] = []
        self.updated_payloads: list[dict[str, object]] = []
        self.deleted_ids: list[int] = []
        self.list_result: tuple[list[SimpleNamespace], int] = ([], 0)
        self.get_by_ids_result: list[SimpleNamespace] = []

    async def create(self, worker_data: dict[str, object]) -> SimpleNamespace:
        self.created_payloads.append(worker_data)
        worker = SimpleNamespace(id=len(self.workers) + 1, **worker_data)
        self.workers[worker.id] = worker
        return worker

    async def get_by_id(self, worker_id: int) -> SimpleNamespace | None:
        return self.workers.get(worker_id)

    async def get_by_ids(self, worker_ids: list[int]) -> list[SimpleNamespace]:
        return self.get_by_ids_result

    async def list(self, limit: int, offset: int) -> tuple[list[SimpleNamespace], int]:
        return self.list_result

    async def update(
        self,
        worker: SimpleNamespace,
        worker_data: dict[str, object],
    ) -> SimpleNamespace:
        self.updated_payloads.append(worker_data)
        for field, value in worker_data.items():
            setattr(worker, field, value)
        return worker

    async def delete(self, worker_id: int) -> bool:
        self.deleted_ids.append(worker_id)
        return self.workers.pop(worker_id, None) is not None


class FakeLocationRepository:
    def __init__(self) -> None:
        self.saved_locations: list[tuple[int, float, float]] = []
        self.locations: dict[int, SimpleNamespace] = {}
        self.window_result: list[WorkerWindowItemResponse] = []
        self.deleted_ids: list[int] = []

    async def set_location(
        self,
        worker_id: int,
        latitude: float,
        longitude: float,
    ) -> SimpleNamespace:
        self.saved_locations.append((worker_id, latitude, longitude))
        location = SimpleNamespace(
            worker_id=worker_id,
            latitude=latitude,
            longitude=longitude,
            updated_at=datetime.now(UTC),
        )
        self.locations[worker_id] = location
        return location

    async def get_location(self, worker_id: int) -> SimpleNamespace | None:
        return self.locations.get(worker_id)

    async def list_locations(self) -> list[SimpleNamespace]:
        return list(self.locations.values())

    async def list_locations_in_window(
        self,
        min_latitude: float,
        min_longitude: float,
        max_latitude: float,
        max_longitude: float,
    ) -> list[WorkerWindowItemResponse]:
        return self.window_result

    async def delete_location(self, worker_id: int) -> None:
        self.deleted_ids.append(worker_id)
        self.locations.pop(worker_id, None)


class FakePipeline:
    def __init__(self, redis: "FakeRedis") -> None:
        self.redis = redis
        self.ops: list[tuple[str, tuple[object, ...], dict[str, object]]] = []

    async def __aenter__(self) -> "FakePipeline":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        return None

    def hset(self, key: str, field: str, value: str) -> None:
        field_key = str(field)
        self.ops.append(("hset", (key, field_key, value), {}))
        self.redis.hashes.setdefault(key, {})[field_key] = value

    def expire(self, key: str, ttl: int) -> None:
        self.ops.append(("expire", (key, ttl), {}))

    def sadd(self, key: str, value: int) -> None:
        self.ops.append(("sadd", (key, value), {}))
        self.redis.sets.setdefault(key, set()).add(str(value))

    def geoadd(self, key: str, values: tuple[float, float, int]) -> None:
        self.ops.append(("geoadd", (key, values), {}))
        longitude, latitude, member = values
        self.redis.geo.setdefault(key, {})[str(member)] = (longitude, latitude)

    def delete(self, key: str) -> None:
        self.ops.append(("delete", (key,), {}))
        self.redis.hashes.pop(key, None)

    def hdel(self, key: str, field: int | str) -> None:
        field_key = str(field)
        self.ops.append(("hdel", (key, field_key), {}))
        hash_bucket = self.redis.hashes.get(key, {})
        hash_bucket.pop(field_key, None)
        if not hash_bucket:
            self.redis.hashes.pop(key, None)

    def srem(self, key: str, value: int) -> None:
        self.ops.append(("srem", (key, value), {}))
        self.redis.sets.get(key, set()).discard(str(value))

    def zrem(self, key: str, value: int) -> None:
        self.ops.append(("zrem", (key, value), {}))
        bucket = self.redis.geo.get(key, {})
        bucket.pop(str(value), None)
        if not bucket:
            self.redis.geo.pop(key, None)

    async def execute(self) -> None:
        self.redis.executed_pipelines.append(self.ops)


class FakeRedis:
    def __init__(self) -> None:
        self.hashes: dict[str, dict[str, str]] = {}
        self.sets: dict[str, set[str]] = {}
        self.geo: dict[str, dict[str, tuple[float, float]]] = {}
        self.executed_pipelines: list[list[tuple[str, tuple[object, ...], dict[str, object]]]] = []
        self.geo_search_result: list[object] = []

    def pipeline(self, transaction: bool = True) -> FakePipeline:
        return FakePipeline(self)

    async def hget(self, key: str, field: int | str) -> str | None:
        return self.hashes.get(key, {}).get(str(field))

    async def hmget(self, key: str, *fields: str) -> list[str | None]:
        data = self.hashes.get(key, {})
        return [data.get(field) for field in fields]

    async def geopos(self, key: str, *members: str) -> list[tuple[float, float] | None]:
        bucket = self.geo.get(key, {})
        return [bucket.get(str(member)) for member in members]

    async def smembers(self, key: str) -> set[str]:
        return self.sets.get(key, set())

    async def geosearch(self, *args, **kwargs) -> list[object]:
        return self.geo_search_result

    async def srem(self, key: str, value: int) -> None:
        self.sets.get(key, set()).discard(str(value))

    async def zrem(self, key: str, value: str | int) -> None:
        bucket = self.geo.get(key, {})
        bucket.pop(str(value), None)
        if not bucket:
            self.geo.pop(key, None)


class WorkerServiceTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.worker_repository = FakeWorkerRepository()
        self.location_repository = FakeLocationRepository()
        self.service = WorkerService(self.worker_repository, self.location_repository)
        self.window_service = WorkerWindowService(self.location_repository)

    async def test_create_worker_returns_created_worker(self) -> None:
        worker = await self.service.create_worker(
            WorkerCreate(
                full_name="Ali Hasanov",
                phone_number="+994510000000",
                role="driver",
                status=WorkerStatus.ACTIVE,
            )
        )

        self.assertEqual(worker.full_name, "Ali Hasanov")
        self.assertEqual(self.worker_repository.created_payloads[0]["role"], "driver")

    async def test_update_worker_location_writes_to_location_repository(self) -> None:
        worker = SimpleNamespace(id=1, full_name="Worker", status=WorkerStatus.ACTIVE.value)
        self.worker_repository.workers[worker.id] = worker

        location = await self.service.update_worker_location(
            worker_id=1,
            payload=WorkerLocationUpdate(latitude=40.4, longitude=49.8),
        )

        self.assertEqual(location.worker_id, 1)
        self.assertEqual(self.location_repository.saved_locations[0], (1, 40.4, 49.8))

    async def test_list_workers_in_window_returns_redis_geo_results(self) -> None:
        item = WorkerWindowItemResponse(
            worker_id=7,
            latitude=40.4,
            longitude=49.8,
        )
        self.location_repository.window_result = [item]

        items = await self.window_service.list_workers_in_window(
            min_lat=40.0,
            min_lon=49.0,
            max_lat=41.0,
            max_lon=50.0,
        )

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].worker_id, 7)
        self.assertEqual(items[0].latitude, 40.4)
        self.assertEqual(items[0].longitude, 49.8)

    async def test_delete_worker_removes_worker_location(self) -> None:
        worker = SimpleNamespace(id=5, full_name="Worker 5", status=WorkerStatus.ACTIVE)
        self.worker_repository.workers[worker.id] = worker
        self.location_repository.locations[worker.id] = SimpleNamespace(worker_id=worker.id)

        await self.service.delete_worker(worker.id)

        self.assertIn(worker.id, self.worker_repository.deleted_ids)
        self.assertIn(worker.id, self.location_repository.deleted_ids)

    async def test_get_worker_location_raises_for_missing_location(self) -> None:
        worker = SimpleNamespace(id=9, full_name="Worker 9", status=WorkerStatus.ACTIVE)
        self.worker_repository.workers[worker.id] = worker

        with self.assertRaisesRegex(NotFoundError, "Location for worker 9 not found"):
            await self.service.get_worker_location(worker.id)


class WorkerLocationRepositoryTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.redis = FakeRedis()
        self.repository = WorkerLocationRepository(self.redis)

    async def test_set_location_writes_hash_set_and_geo(self) -> None:
        location = await self.repository.set_location(
            worker_id=3,
            latitude=40.123,
            longitude=49.456,
        )

        self.assertEqual(location.worker_id, 3)
        self.assertIsNone(location.direction)
        self.assertNotIn(self.repository.direction_key, self.redis.hashes)
        self.assertIn("workers:location_ids", self.redis.sets)
        self.assertIn("workers:locations:geo", self.redis.geo)
        self.assertTrue(self.redis.executed_pipelines)

    async def test_set_location_computes_direction_from_previous_position(self) -> None:
        await self.repository.set_location(
            worker_id=3,
            latitude=40.123,
            longitude=49.456,
        )

        location = await self.repository.set_location(
            worker_id=3,
            latitude=40.124,
            longitude=49.466,
        )

        self.assertIsNotNone(location.direction)
        self.assertAlmostEqual(
            location.direction,
            calculate_bearing_degrees(40.123, 49.456, 40.124, 49.466),
            places=6,
        )
        self.assertEqual(
            self.redis.hashes[self.repository.direction_key]["3"],
            str(location.direction),
        )
        self.assertEqual(
            location.direction,
            calculate_bearing_degrees(40.123, 49.456, 40.124, 49.466),
        )

    async def test_get_location_returns_none_for_missing_worker(self) -> None:
        self.redis.sets[self.repository.location_ids_key] = {"123"}

        location = await self.repository.get_location(123)

        self.assertIsNone(location)
        self.assertNotIn("123", self.redis.sets[self.repository.location_ids_key])

    async def test_list_locations_orders_by_updated_at_desc(self) -> None:
        self.redis.sets[self.repository.location_ids_key] = {"1", "2"}
        self.redis.geo[self.repository.geo_key] = {
            "1": (49.1, 40.1),
            "2": (49.2, 40.2),
        }
        self.redis.hashes[self.repository.direction_key] = {
            "1": "90.0",
            "2": "180.0",
        }

        locations = await self.repository.list_locations()

        self.assertEqual([location.worker_id for location in locations], [1, 2])
        self.assertEqual([location.direction for location in locations], [90.0, 180.0])

    async def test_list_locations_in_window_returns_geo_results_with_coords(self) -> None:
        self.redis.geo_search_result = [
            ["7", [49.8, 40.4]],
            ["8", [49.1, 40.1]],
        ]
        self.redis.hashes[self.repository.direction_key] = {
            "7": "270.0",
        }

        locations = await self.repository.list_locations_in_window(
            min_latitude=40.0,
            min_longitude=49.0,
            max_latitude=41.0,
            max_longitude=50.0,
        )

        self.assertEqual([location.worker_id for location in locations], [7, 8])
        self.assertEqual(
            [(location.latitude, location.longitude) for location in locations],
            [(40.4, 49.8), (40.1, 49.1)],
        )
        self.assertEqual([location.direction for location in locations], [270.0, None])
