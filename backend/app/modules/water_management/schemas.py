"""Pydantic schemas for the water-management API."""
from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class WaterHotspot(BaseModel):
    id: str
    rank: int
    name: str
    lon: float
    lat: float
    risk: float
    risk_band: str
    imperviousness_pct: int
    upstream_area_ha: float
    required_capacity_m3s: float
    actual_capacity_m3s: float | None
    risk_breakdown: Dict[str, float]
    recommended_actions: List[str]
    design_capacity_m3s: float | None = None
    capacity_gap_m3s: float | None = None


class WaterHotspotListResponse(BaseModel):
    district: str
    hotspots: List[WaterHotspot]


class WaterHotspotDetailResponse(WaterHotspot):
    pass


class WaterForecastDay(BaseModel):
    date: str
    label: str
    short: str
    peak_intensity_mm_h: float
    total_mm: float
    peak_time: str
    storm: bool


class WaterForecastResponse(BaseModel):
    source: str
    horizon_hours: int
    peak_intensity_mm_h: float
    total_mm: float
    storm: bool
    series: List[Dict[str, Any]]
    days: List[WaterForecastDay] = []
    error: str | None = None


class WaterSimulateRequest(BaseModel):
    intensity_mm_h: float = Field(..., ge=0, le=200)
    duration_h: int = Field(2, ge=1, le=24)


class WaterSimulationHotspot(BaseModel):
    id: str
    name: str
    lon: float
    lat: float
    risk: float
    risk_band: str
    required_capacity_m3s: float
    predicted_runoff_m3s: float
    load_ratio: float
    activation_intensity_mm_h: float
    triggered: bool


class WaterSimulationCatchment(BaseModel):
    id: str
    flooded: bool
    stress: float


class WaterSimulationResponse(BaseModel):
    intensity_mm_h: float
    duration_h: int
    storm: bool
    triggered_count: int
    flooded_catchments: int
    hotspots: List[WaterSimulationHotspot]
    catchments: List[WaterSimulationCatchment]


class WaterWorkOrder(BaseModel):
    id: str
    hotspot_id: str
    hotspot_name: str
    lon: float
    lat: float
    priority: str
    crew: str
    action: str
    actions: List[str]
    window_minutes: int
    predicted_runoff_m3s: float
    required_capacity_m3s: float
    status: str = "proposed"


class WaterDispatchResponse(BaseModel):
    intensity_mm_h: float
    duration_h: int
    storm: bool
    summary: str
    work_orders: List[WaterWorkOrder]


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    properties: Dict[str, Any]
    geometry: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class FloodOverlayResponse(BaseModel):
    district: str
    intensity_mm_h: float
    source: str
    flooded_count: int
    features: GeoJSONFeatureCollection
    flow: GeoJSONFeatureCollection | None = None
    shapefile: GeoJSONFeatureCollection | None = None
