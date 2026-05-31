"""Water-management orchestration with cache-aware responses."""
from __future__ import annotations

import json

from redis.asyncio import Redis

from app.core.config import settings

from . import config, data_store, dispatch, forecast
from .runoff import capacity_gap_m3s, required_capacity_m3s
from .schemas import GeoJSONFeature, GeoJSONFeatureCollection

_FORECAST_CACHE_KEY = "water-management:forecast:latest"
_FLOOD_OVERLAY_CACHE_PREFIX = "water-management:flood-overlay:"


class WaterManagementService:
    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    async def get_district(self) -> dict:
        return data_store.get_layer("district")

    async def get_layer(self, name: str) -> dict:
        return data_store.get_layer(name)

    async def list_hotspots(self) -> list[dict]:
        return data_store.hotspots()

    async def get_hotspot(self, hotspot_id: str) -> dict | None:
        return data_store.hotspot(hotspot_id)

    async def get_forecast(self) -> dict:
        cached = await self.redis.get(_FORECAST_CACHE_KEY)
        if cached:
            data = json.loads(cached)
            data.setdefault("storm", forecast.is_storm(data))
            return data

        result = await forecast.fetch_forecast(
            hours=config.FORECAST_HORIZON_HOURS,
            days=config.FORECAST_DAYS,
            timeout_s=settings.water_management_forecast_timeout_seconds,
        )
        result.setdefault("storm", forecast.is_storm(result))
        await self.redis.setex(
            _FORECAST_CACHE_KEY,
            settings.water_management_forecast_cache_ttl_seconds,
            json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        )
        return result

    async def simulate(self, intensity_mm_h: float, duration_h: int) -> dict:
        hotspot_rows = dispatch.evaluate(intensity_mm_h)
        catchments = dispatch.evaluate_catchments(intensity_mm_h)
        return {
            "intensity_mm_h": intensity_mm_h,
            "duration_h": duration_h,
            "storm": intensity_mm_h >= config.STORM_INTENSITY_MM_H,
            "triggered_count": sum(1 for row in hotspot_rows if row["triggered"]),
            "flooded_catchments": sum(1 for row in catchments if row["flooded"]),
            "hotspots": hotspot_rows,
            "catchments": catchments,
        }

    async def preview_dispatch(self, intensity_mm_h: float, duration_h: int) -> dict:
        return dispatch.build_work_orders(intensity_mm_h, duration_h)

    async def flood_overlay(
        self,
        intensity_mm_h: float | None = None,
        *,
        min_risk: float = 35.0,
        use_forecast: bool = True,
        include_flow_lines: bool = False,
        include_shapefile: bool = False,
    ) -> dict:
        resolved_intensity = intensity_mm_h
        source = "scenario"
        if resolved_intensity is None and use_forecast:
            forecast_data = await self.get_forecast()
            resolved_intensity = forecast.resolve_intensity(forecast_data, None)
            source = forecast_data.get("source", "forecast")
        elif resolved_intensity is None:
            resolved_intensity = 0.0

        cache_key = (
            f"{_FLOOD_OVERLAY_CACHE_PREFIX}{resolved_intensity:.1f}:{min_risk:.1f}:"
            f"{int(include_flow_lines)}:{int(include_shapefile)}"
        )
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)

        features: list[GeoJSONFeature] = []
        flooded_count = 0
        for catchment in data_store.catchments():
            if catchment["risk"] < min_risk:
                continue

            activation = dispatch.activation_intensity(catchment["risk"])
            flooded = resolved_intensity >= activation
            if flooded:
                flooded_count += 1

            properties = {
                "id": catchment["id"],
                "street": catchment.get("street"),
                "risk": catchment["risk"],
                "risk_band": catchment["risk_band"],
                "imperviousness": catchment["imperviousness"],
                "sink_index": catchment["sink_index"],
                "upstream_norm": catchment["upstream_norm"],
                "low_slope_index": catchment["low_slope_index"],
                "area_ha": catchment["area_ha"],
                "upstream_area_ha": catchment["upstream_area_ha"],
                "required_capacity_m3s": catchment["required_capacity_m3s"],
                "actual_capacity_m3s": catchment.get("actual_capacity_m3s"),
                "activation_intensity_mm_h": activation,
                "flooded": flooded,
                "stress": round(resolved_intensity / activation, 2) if activation else 0.0,
            }
            features.append(
                GeoJSONFeature(
                    properties=properties,
                    geometry=catchment["geometry"],
                )
            )

        payload = {
            "district": config.DISTRICT_ID,
            "intensity_mm_h": round(resolved_intensity, 1),
            "source": source,
            "flooded_count": flooded_count,
            "features": GeoJSONFeatureCollection(features=features).model_dump(mode="json"),
        }
        if include_flow_lines:
            payload["flow"] = data_store.get_layer("flow")
        if include_shapefile:
            payload["shapefile"] = data_store.get_layer("district")
        await self.redis.setex(
            cache_key,
            settings.water_management_overlay_cache_ttl_seconds,
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        )
        return payload

    async def hotspot_detail(self, hotspot_id: str) -> dict | None:
        hotspot = data_store.hotspot(hotspot_id)
        if hotspot is None:
            return None
        hotspot = dict(hotspot)
        hotspot["capacity_gap_m3s"] = capacity_gap_m3s(
            hotspot["required_capacity_m3s"],
            hotspot.get("actual_capacity_m3s"),
        )
        hotspot["design_capacity_m3s"] = required_capacity_m3s(
            hotspot["imperviousness_pct"] / 100.0,
            hotspot["upstream_area_ha"],
        )
        return hotspot
