"""Rational-Method runoff calculations."""
from __future__ import annotations

from . import config


def peak_runoff_m3s(imperviousness: float, intensity_mm_h: float, area_ha: float) -> float:
    c = config.runoff_coefficient(imperviousness)
    return config.RATIONAL_K * c * intensity_mm_h * area_ha


def required_capacity_m3s(imperviousness: float, area_ha: float) -> float:
    return peak_runoff_m3s(imperviousness, config.DESIGN_STORM_MM_H, area_ha)


def capacity_gap_m3s(required: float, actual: float | None) -> float | None:
    if actual is None:
        return None
    return round(required - actual, 3)

