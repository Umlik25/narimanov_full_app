"""Pydantic schemas — the API contract consumed by the OpenWave app."""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    intensity_mm_h: float = Field(
        ..., ge=0, le=200, description="Rainfall intensity to evaluate (mm/h)."
    )
    duration_h: int = Field(2, ge=1, le=24, description="Storm duration (hours).")


class HotspotLoad(BaseModel):
    id: str
    name: str
    lon: float
    lat: float
    risk: float
    risk_band: str
    required_capacity_m3s: float
    predicted_runoff_m3s: float
    load_ratio: float                 # predicted runoff / required capacity
    activation_intensity_mm_h: float  # rainfall at which this zone starts flooding
    triggered: bool


class CatchmentLoad(BaseModel):
    id: str
    flooded: bool
    stress: float


class SimulateResponse(BaseModel):
    intensity_mm_h: float
    duration_h: int
    storm: bool
    triggered_count: int
    flooded_catchments: int
    hotspots: List[HotspotLoad]
    catchments: List[CatchmentLoad]


class WorkOrder(BaseModel):
    id: str
    hotspot_id: str
    hotspot_name: str
    lon: float
    lat: float
    priority: str                     # critical | high | medium
    crew: str
    action: str
    actions: List[str]
    window_minutes: int               # act within this many minutes (before the rain)
    predicted_runoff_m3s: float
    required_capacity_m3s: float
    status: str = "proposed"


class DispatchResponse(BaseModel):
    intensity_mm_h: float
    duration_h: int
    storm: bool
    summary: str
    work_orders: List[WorkOrder]


class DayForecast(BaseModel):
    date: str                         # ISO 'YYYY-MM-DD'
    label: str                        # 'Today' / weekday name
    short: str                        # 'dd Mon'
    peak_intensity_mm_h: float        # worst hourly intensity -> drives the model
    total_mm: float
    peak_time: str                    # 'HH:MM' of the peak hour
    storm: bool


class ForecastResponse(BaseModel):
    source: str
    horizon_hours: int
    peak_intensity_mm_h: float
    total_mm: float
    storm: bool
    series: List[Dict]
    days: List[DayForecast] = []
    error: Optional[str] = None
