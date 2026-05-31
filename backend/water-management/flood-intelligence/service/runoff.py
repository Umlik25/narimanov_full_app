"""Rational-Method runoff calculations.

Small-urban-catchment hydrology, kept deliberately simple and explainable:

    Q = K * C * i * A

where Q is peak runoff (m3/s), C the runoff coefficient (from imperviousness),
i rainfall intensity (mm/h) and A catchment area (hectares). See CLAUDE.md §4.
"""
from __future__ import annotations

from . import config


def peak_runoff_m3s(imperviousness: float, intensity_mm_h: float, area_ha: float) -> float:
    """Peak runoff for a catchment under a given rainfall intensity."""
    c = config.runoff_coefficient(imperviousness)
    return config.RATIONAL_K * c * intensity_mm_h * area_ha


def required_capacity_m3s(imperviousness: float, area_ha: float) -> float:
    """Drainage capacity the catchment *should* provide for the design storm."""
    return peak_runoff_m3s(imperviousness, config.DESIGN_STORM_MM_H, area_ha)


def capacity_gap_m3s(required: float, actual: float | None) -> float | None:
    """Shortfall between required and actual capacity.

    Returns None when actual capacity is unknown (no utility pipe data). We never
    invent an actual figure — see CLAUDE.md §2.4.
    """
    if actual is None:
        return None
    return round(required - actual, 3)
