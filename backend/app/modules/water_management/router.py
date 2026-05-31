"""HTTP routes for the water-management module."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from redis.asyncio import Redis

from app.dependencies.redis import get_redis_client

from . import config
from .schemas import (
    FloodOverlayResponse,
    WaterDispatchResponse,
    WaterForecastResponse,
    WaterHotspotDetailResponse,
    WaterHotspotListResponse,
    WaterSimulateRequest,
    WaterSimulationResponse,
)
from .service import WaterManagementService

router = APIRouter(prefix="/water-management", tags=["Water Management"])


def get_water_management_service(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> WaterManagementService:
    return WaterManagementService(redis)


@router.get("/health", summary="Water-management health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "district": config.DISTRICT_ID,
        "layers": ["district", "catchments", "flow", "hotspots"],
    }


@router.get("/district", summary="Get district boundary")
async def get_district(
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> dict:
    return await service.get_district()


@router.get("/layers/{name}", summary="Get precomputed layer")
async def get_layer(
    name: str,
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> dict:
    try:
        return await service.get_layer(name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown layer '{name}'") from exc


@router.get(
    "/hotspots",
    response_model=WaterHotspotListResponse,
    summary="List flood hotspots",
)
async def list_hotspots(
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> WaterHotspotListResponse:
    return WaterHotspotListResponse(
        district=config.DISTRICT_NAME_EN,
        hotspots=[WaterHotspotDetailResponse.model_validate(h) for h in await service.list_hotspots()],
    )


@router.get(
    "/hotspots/{hotspot_id}",
    response_model=WaterHotspotDetailResponse,
    summary="Get hotspot detail",
)
async def get_hotspot(
    hotspot_id: str,
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> WaterHotspotDetailResponse:
    hotspot = await service.hotspot_detail(hotspot_id)
    if hotspot is None:
        raise HTTPException(status_code=404, detail=f"Unknown hotspot '{hotspot_id}'")
    return WaterHotspotDetailResponse.model_validate(hotspot)


@router.get(
    "/forecast",
    response_model=WaterForecastResponse,
    summary="Get live rainfall forecast",
)
async def get_forecast(
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> WaterForecastResponse:
    return WaterForecastResponse.model_validate(await service.get_forecast())


@router.post(
    "/simulate",
    response_model=WaterSimulationResponse,
    summary="Simulate a rainfall scenario",
)
async def post_simulate(
    payload: WaterSimulateRequest,
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> WaterSimulationResponse:
    return WaterSimulationResponse.model_validate(
        await service.simulate(payload.intensity_mm_h, payload.duration_h)
    )


@router.post(
    "/dispatch/preview",
    response_model=WaterDispatchResponse,
    summary="Preview preventive dispatch work-orders",
)
async def post_dispatch_preview(
    payload: WaterSimulateRequest,
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
) -> WaterDispatchResponse:
    return WaterDispatchResponse.model_validate(
        await service.preview_dispatch(payload.intensity_mm_h, payload.duration_h)
    )


@router.get(
    "/flood-areas",
    response_model=FloodOverlayResponse,
    summary="Map-ready flood-prone catchments",
)
async def get_flood_areas(
    service: Annotated[WaterManagementService, Depends(get_water_management_service)],
    intensity_mm_h: Annotated[float | None, Query(ge=0, le=200)] = None,
    min_risk: Annotated[float, Query(ge=0, le=100)] = 35.0,
    include_flow_lines: bool = False,
    include_shapefile: bool = False,
) -> FloodOverlayResponse:
    return FloodOverlayResponse.model_validate(
        await service.flood_overlay(
            intensity_mm_h=intensity_mm_h,
            min_risk=min_risk,
            include_flow_lines=include_flow_lines,
            include_shapefile=include_shapefile,
        )
    )
