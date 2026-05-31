from datetime import UTC, datetime
from math import cos, radians

from redis.asyncio import Redis
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.workers.models import Worker
from app.modules.workers.schemas import (
    WorkerLocationResponse,
    WorkerWindowItemResponse,
)
from app.modules.workers.utils import calculate_bearing_degrees


class WorkerRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, worker_data: dict[str, object]) -> Worker:
        worker = Worker(**worker_data)
        self.session.add(worker)
        await self.session.commit()
        await self.session.refresh(worker)
        return worker

    async def get_by_id(self, worker_id: int) -> Worker | None:
        result = await self.session.execute(
            select(Worker).where(Worker.id == worker_id)
        )
        return result.scalar_one_or_none()

    async def get_by_ids(self, worker_ids: list[int]) -> list[Worker]:
        if not worker_ids:
            return []

        result = await self.session.execute(
            select(Worker).where(Worker.id.in_(worker_ids))
        )
        return list(result.scalars().all())

    async def list(self, limit: int, offset: int) -> tuple[list[Worker], int]:
        total_result = await self.session.execute(select(func.count()).select_from(Worker))
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Worker)
            .order_by(Worker.created_at.desc(), Worker.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def update(self, worker: Worker, worker_data: dict[str, object]) -> Worker:
        for field, value in worker_data.items():
            setattr(worker, field, value)

        await self.session.commit()
        await self.session.refresh(worker)
        return worker

    async def delete(self, worker_id: int) -> bool:
        result = await self.session.execute(delete(Worker).where(Worker.id == worker_id))
        await self.session.commit()
        return result.rowcount > 0


class WorkerLocationRepository:
    location_ids_key = "workers:location_ids"
    geo_key = "workers:locations:geo"
    direction_key = "workers:locations:directions"

    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    def _parse_geo_position(
        self,
        position: tuple[float, float] | list[float] | None,
    ) -> tuple[float, float] | None:
        if position is None:
            return None
        return float(position[1]), float(position[0])

    async def set_location(
        self,
        worker_id: int,
        latitude: float,
        longitude: float,
    ) -> WorkerLocationResponse:
        previous_position = await self.redis.geopos(self.geo_key, str(worker_id))
        updated_at = datetime.now(UTC)
        direction = None
        if previous_position and previous_position[0] is not None:
            previous_latitude, previous_longitude = self._parse_geo_position(
                previous_position[0]
            ) or (None, None)
            if previous_latitude is not None and previous_longitude is not None:
                direction = calculate_bearing_degrees(
                    previous_latitude,
                    previous_longitude,
                    latitude,
                    longitude,
                )

        async with self.redis.pipeline(transaction=True) as pipe:
            if direction is None:
                pipe.hdel(self.direction_key, str(worker_id))
            else:
                pipe.hset(self.direction_key, str(worker_id), str(direction))
            pipe.sadd(self.location_ids_key, worker_id)
            pipe.geoadd(self.geo_key, (longitude, latitude, worker_id))
            await pipe.execute()

        return WorkerLocationResponse(
            worker_id=worker_id,
            latitude=latitude,
            longitude=longitude,
            direction=direction,
            updated_at=updated_at,
        )

    async def get_location(self, worker_id: int) -> WorkerLocationResponse | None:
        position = await self.redis.geopos(self.geo_key, str(worker_id))
        if not position or position[0] is None:
            await self.redis.srem(self.location_ids_key, worker_id)
            return None

        latitude, longitude = self._parse_geo_position(position[0]) or (None, None)
        if latitude is None or longitude is None:
            await self.redis.srem(self.location_ids_key, worker_id)
            return None

        direction = await self.redis.hget(self.direction_key, str(worker_id))
        return WorkerLocationResponse(
            worker_id=worker_id,
            latitude=latitude,
            longitude=longitude,
            direction=float(direction) if direction is not None else None,
            updated_at=None,
        )

    async def list_locations(self) -> list[WorkerLocationResponse]:
        worker_ids = await self.redis.smembers(self.location_ids_key)
        if not worker_ids:
            return []

        ordered_worker_ids = sorted(worker_ids, key=lambda worker_id: int(worker_id))
        positions = await self.redis.geopos(self.geo_key, *ordered_worker_ids)
        directions = await self.redis.hmget(self.direction_key, *ordered_worker_ids)
        locations = [
            WorkerLocationResponse(
                worker_id=int(worker_id),
                latitude=latitude,
                longitude=longitude,
                direction=float(direction) if direction is not None else None,
                updated_at=None,
            )
            for worker_id, position, direction in zip(
                ordered_worker_ids,
                positions,
                directions,
                strict=False,
            )
            if position is not None
            for latitude, longitude in [self._parse_geo_position(position) or (None, None)]
            if latitude is not None and longitude is not None
        ]
        return locations

    async def list_locations_in_window(
        self,
        min_latitude: float,
        min_longitude: float,
        max_latitude: float,
        max_longitude: float,
    ) -> list[WorkerWindowItemResponse]:
        center_latitude = (min_latitude + max_latitude) / 2
        center_longitude = (min_longitude + max_longitude) / 2
        width_km = self._longitude_delta_to_km(
            max_longitude - min_longitude,
            center_latitude,
        )
        height_km = self._latitude_delta_to_km(max_latitude - min_latitude)

        geo_results = await self.redis.geosearch(
            self.geo_key,
            longitude=center_longitude,
            latitude=center_latitude,
            width=max(width_km, 0.001),
            height=max(height_km, 0.001),
            unit="km",
            sort="ASC",
            withcoord=True,
        )

        parsed_geo: list[tuple[int, float, float]] = []
        worker_ids: list[str] = []
        for item in geo_results:
            parsed_item = self._parse_geosearch_item(item)
            if parsed_item is None:
                continue
            worker_ids.append(str(parsed_item[0]))
            parsed_geo.append(parsed_item)
        if not parsed_geo:
            return []

        directions = await self.redis.hmget(self.direction_key, *worker_ids)

        locations: list[WorkerWindowItemResponse] = []
        for (worker_id, latitude, longitude), raw_location in zip(parsed_geo, directions, strict=False):
            direction = None
            if raw_location is not None:
                direction = float(raw_location)
            locations.append(
                WorkerWindowItemResponse(
                    worker_id=worker_id,
                    latitude=latitude,
                    longitude=longitude,
                    direction=direction,
                )
            )
        return locations

    def _parse_geosearch_item(
        self,
        item: bytes | str | list[bytes | str | float | int | tuple[float, float]],
    ) -> tuple[int, float, float] | None:
        if isinstance(item, (bytes, str)):
            return None

        if not isinstance(item, list) or not item:
            return None

        worker_id_raw = item[0]
        try:
            worker_id = int(worker_id_raw)
        except (TypeError, ValueError):
            return None

        coordinate: tuple[float, float] | list[float] | None = None
        for part in reversed(item[1:]):
            if isinstance(part, (list, tuple)) and len(part) == 2:
                coordinate = part
                break

        if coordinate is None:
            return None

        longitude = float(coordinate[0])
        latitude = float(coordinate[1])
        return worker_id, latitude, longitude

    async def delete_location(self, worker_id: int) -> None:
        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.hdel(self.direction_key, str(worker_id))
            pipe.srem(self.location_ids_key, worker_id)
            pipe.zrem(self.geo_key, worker_id)
            await pipe.execute()

    def _latitude_delta_to_km(self, latitude_delta: float) -> float:
        return latitude_delta * 110.574

    def _longitude_delta_to_km(
        self,
        longitude_delta: float,
        latitude: float,
    ) -> float:
        return longitude_delta * 111.320 * cos(radians(latitude))
