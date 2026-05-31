from __future__ import annotations

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.core.config import settings
from app.dependencies.redis import get_redis_client
from app.main import app


class FakeRedis:
    def __init__(self) -> None:
        self.values: dict[str, str] = {}
        self.expirations: dict[str, int] = {}

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def setex(self, key: str, ttl: int, value: str) -> None:
        self.values[key] = value
        self.expirations[key] = ttl


class TestWaterManagementApi:
    def setup_method(self) -> None:
        self.redis = FakeRedis()
        app.dependency_overrides[get_redis_client] = lambda: self.redis
        self.client = TestClient(app)

    def teardown_method(self) -> None:
        app.dependency_overrides.clear()

    def test_health_endpoint_is_available(self) -> None:
        response = self.client.get("/water-management/health")

        assert response.status_code == 200
        assert response.json()["district"] == "narimanov"

    def test_hotspots_endpoint_returns_ranked_hotspots(self) -> None:
        response = self.client.get("/water-management/hotspots")

        assert response.status_code == 200
        payload = response.json()
        assert payload["district"] == "Narimanov District"
        assert len(payload["hotspots"]) >= 1
        assert payload["hotspots"][0]["id"] == "H1"

    def test_flood_areas_endpoint_returns_feature_collection(self) -> None:
        response = self.client.get("/water-management/flood-areas", params={"intensity_mm_h": 35})

        assert response.status_code == 200
        payload = response.json()
        assert payload["district"] == "narimanov"
        assert payload["flooded_count"] > 0
        assert payload["features"]["type"] == "FeatureCollection"
        assert len(payload["features"]["features"]) > 0
        assert all(
            feature["properties"]["risk"] >= 35
            for feature in payload["features"]["features"]
        )

    def test_flood_areas_endpoint_can_include_flow_lines_and_shapefile(self) -> None:
        response = self.client.get(
            "/water-management/flood-areas",
            params={
                "intensity_mm_h": 35,
                "include_flow_lines": True,
                "include_shapefile": True,
            },
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["flow"]["type"] == "FeatureCollection"
        assert payload["shapefile"]["type"] == "FeatureCollection"
        assert len(payload["flow"]["features"]) > 0
        assert len(payload["shapefile"]["features"]) > 0

    def test_forecast_endpoint_uses_cached_open_meteo_response(self) -> None:
        forecast_payload = {
            "source": "open-meteo",
            "horizon_hours": 6,
            "peak_intensity_mm_h": 11.5,
            "total_mm": 21.3,
            "storm": False,
            "series": [{"hour": "2026-05-30T10:00", "precipitation_mm": 0.4}],
            "days": [],
            "error": None,
        }

        async_mock = AsyncMock(return_value=forecast_payload)
        with patch("app.modules.water_management.forecast.fetch_forecast", async_mock):
            first = self.client.get("/water-management/forecast")
            second = self.client.get("/water-management/forecast")

        assert first.status_code == 200
        assert second.status_code == 200
        assert first.json()["peak_intensity_mm_h"] == 11.5
        assert second.json()["peak_intensity_mm_h"] == 11.5
        assert async_mock.await_count == 1
        assert settings.water_management_forecast_cache_ttl_seconds == self.redis.expirations[
            "water-management:forecast:latest"
        ]
