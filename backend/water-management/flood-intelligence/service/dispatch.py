"""Forecast -> preventive work-orders. The hero feature (CLAUDE.md §0, §4, §7).

Given a rainfall intensity, we predict each hotspot's peak runoff and decide which
zones need a crew dispatched *before* the rain. Higher-risk zones flood at lower
intensity, so a drizzle activates only the worst spots while a real storm lights
up the district — which is exactly what makes the demo slider compelling.
"""
from __future__ import annotations

from typing import Dict, List

from . import config, data_store

# Crews available to the Narimanov executive authority (would come from the main
# OpenWave roster after merge).
_CREWS = ["Brigade A", "Brigade B", "Brigade C", "Mobile pump unit", "Rapid response team"]

# Risk -> activation-intensity mapping. A zone at risk 75 starts flooding at
# ~12 mm/h; a zone at risk 55 needs ~30 mm/h. Linear in between, clamped.
_RISK_HI, _RISK_LO = 75.0, 55.0
_ACT_AT_HI, _ACT_AT_LO = 12.0, 30.0


def activation_intensity(risk: float) -> float:
    """Rainfall intensity (mm/h) at which a zone of this risk begins to flood."""
    if risk >= _RISK_HI:
        return _ACT_AT_HI
    if risk <= _RISK_LO:
        return _ACT_AT_LO
    frac = (risk - _RISK_LO) / (_RISK_HI - _RISK_LO)
    return round(_ACT_AT_LO + frac * (_ACT_AT_HI - _ACT_AT_LO), 1)


def predicted_runoff(required_capacity: float, intensity_mm_h: float) -> float:
    """Peak runoff scales linearly with intensity for fixed C and area."""
    return round(required_capacity * intensity_mm_h / config.DESIGN_STORM_MM_H, 3)


def evaluate(intensity_mm_h: float) -> List[Dict]:
    """Per-hotspot load under the given intensity (used by /simulate)."""
    rows = []
    for h in data_store.hotspots():
        req = h["required_capacity_m3s"]
        act = activation_intensity(h["risk"])
        runoff = predicted_runoff(req, intensity_mm_h)
        rows.append({
            "id": h["id"],
            "name": h["name"],
            "lon": h["lon"],
            "lat": h["lat"],
            "risk": h["risk"],
            "risk_band": h["risk_band"],
            "required_capacity_m3s": req,
            "predicted_runoff_m3s": runoff,
            "load_ratio": round(runoff / req, 2) if req else 0.0,
            "activation_intensity_mm_h": act,
            "triggered": intensity_mm_h >= act,
        })
    rows.sort(key=lambda r: r["risk"], reverse=True)
    return rows


def evaluate_catchments(intensity_mm_h: float) -> List[Dict]:
    """Per-catchment flood state under the given intensity (drives the live map).

    Same model as the hotspots: a cell starts flooding once intensity passes its
    risk-derived activation threshold; `stress` is how far past it we are.
    """
    rows = []
    for feat in data_store.get_layer("catchments")["features"]:
        p = feat["properties"]
        act = activation_intensity(p["risk"])
        stress = round(intensity_mm_h / act, 2) if act else 0.0
        rows.append({
            "id": p["id"],
            "flooded": intensity_mm_h >= act,
            "stress": stress,
        })
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
    """Generate preventive work-orders for every triggered hotspot."""
    loads = [r for r in evaluate(intensity_mm_h) if r["triggered"]]
    orders: List[Dict] = []
    for i, r in enumerate(loads):
        hot = data_store.hotspot(r["id"]) or {}
        actions = hot.get("recommended_actions", [])
        priority = _priority(intensity_mm_h, r["activation_intensity_mm_h"])
        orders.append({
            "id": f"WO-{r['id']}",
            "hotspot_id": r["id"],
            "hotspot_name": r["name"],
            "lon": r["lon"],
            "lat": r["lat"],
            "priority": priority,
            "crew": _CREWS[i % len(_CREWS)],
            "action": actions[0] if actions else "Inspect drainage points",
            "actions": actions,
            "window_minutes": _window_minutes(priority),
            "predicted_runoff_m3s": r["predicted_runoff_m3s"],
            "required_capacity_m3s": r["required_capacity_m3s"],
            "status": "proposed",
        })

    storm = intensity_mm_h >= config.STORM_INTENSITY_MM_H
    if orders:
        summary = (
            f"{intensity_mm_h:.0f} mm/h rain forecast: {len(orders)} preventive "
            f"work-orders created for risk zones — BEFORE the rain."
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
