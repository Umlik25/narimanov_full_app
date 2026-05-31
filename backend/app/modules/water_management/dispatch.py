"""Forecast to preventive work-orders."""
from __future__ import annotations

from typing import Dict, List

from . import config, data_store

_CREWS = [
    "Brigade A",
    "Brigade B",
    "Brigade C",
    "Mobile pump unit",
    "Rapid response team",
]

_RISK_HI, _RISK_LO = 75.0, 55.0
_ACT_AT_HI, _ACT_AT_LO = 12.0, 30.0


def activation_intensity(risk: float) -> float:
    if risk >= _RISK_HI:
        return _ACT_AT_HI
    if risk <= _RISK_LO:
        return _ACT_AT_LO
    frac = (risk - _RISK_LO) / (_RISK_HI - _RISK_LO)
    return round(_ACT_AT_LO + frac * (_ACT_AT_HI - _ACT_AT_LO), 1)


def predicted_runoff(required_capacity: float, intensity_mm_h: float) -> float:
    return round(required_capacity * intensity_mm_h / config.DESIGN_STORM_MM_H, 3)


def evaluate(intensity_mm_h: float) -> List[Dict]:
    rows = []
    for hotspot in data_store.hotspots():
        required_capacity = hotspot["required_capacity_m3s"]
        activation = activation_intensity(hotspot["risk"])
        runoff = predicted_runoff(required_capacity, intensity_mm_h)
        rows.append(
            {
                "id": hotspot["id"],
                "name": hotspot["name"],
                "lon": hotspot["lon"],
                "lat": hotspot["lat"],
                "risk": hotspot["risk"],
                "risk_band": hotspot["risk_band"],
                "required_capacity_m3s": required_capacity,
                "predicted_runoff_m3s": runoff,
                "load_ratio": round(runoff / required_capacity, 2) if required_capacity else 0.0,
                "activation_intensity_mm_h": activation,
                "triggered": intensity_mm_h >= activation,
            }
        )
    rows.sort(key=lambda row: row["risk"], reverse=True)
    return rows


def evaluate_catchments(intensity_mm_h: float) -> List[Dict]:
    rows = []
    for feat in data_store.get_layer("catchments")["features"]:
        props = feat["properties"]
        activation = activation_intensity(props["risk"])
        stress = round(intensity_mm_h / activation, 2) if activation else 0.0
        rows.append(
            {
                "id": props["id"],
                "flooded": intensity_mm_h >= activation,
                "stress": stress,
            }
        )
    return rows


def _priority(intensity_mm_h: float, activation: float) -> str:
    if activation <= 0:
        return "medium"
    ratio = intensity_mm_h / activation
    if ratio >= 2.0:
        return "critical"
    if ratio >= 1.4:
        return "high"
    return "medium"


def _window_minutes(priority: str) -> int:
    return {"critical": 60, "high": 120, "medium": 180}.get(priority, 180)


def build_work_orders(intensity_mm_h: float, duration_h: int) -> Dict:
    loads = [row for row in evaluate(intensity_mm_h) if row["triggered"]]
    orders: List[Dict] = []
    for index, row in enumerate(loads):
        hotspot = data_store.hotspot(row["id"]) or {}
        actions = hotspot.get("recommended_actions", [])
        priority = _priority(intensity_mm_h, row["activation_intensity_mm_h"])
        orders.append(
            {
                "id": f"WO-{row['id']}",
                "hotspot_id": row["id"],
                "hotspot_name": row["name"],
                "lon": row["lon"],
                "lat": row["lat"],
                "priority": priority,
                "crew": _CREWS[index % len(_CREWS)],
                "action": actions[0] if actions else "Inspect drainage points",
                "actions": actions,
                "window_minutes": _window_minutes(priority),
                "predicted_runoff_m3s": row["predicted_runoff_m3s"],
                "required_capacity_m3s": row["required_capacity_m3s"],
                "status": "proposed",
            }
        )

    storm = intensity_mm_h >= config.STORM_INTENSITY_MM_H
    if orders:
        summary = (
            f"{intensity_mm_h:.0f} mm/h rain forecast: {len(orders)} preventive "
            f"work-orders created for risk zones before the rain."
        )
    else:
        summary = (
            f"{intensity_mm_h:.0f} mm/h: storm threshold not reached, no preventive "
            f"work-orders required."
        )
    return {
        "intensity_mm_h": intensity_mm_h,
        "duration_h": duration_h,
        "storm": storm,
        "summary": summary,
        "work_orders": orders,
    }

