"""Central configuration for AquaWatch.

Every tunable lives here so logic stays clean and the model is auditable.
Both the runtime service and the offline pipeline import from this module.
"""
from __future__ import annotations

from pathlib import Path

# --- Paths -------------------------------------------------------------------
SERVICE_DIR = Path(__file__).resolve().parent
ROOT_DIR = SERVICE_DIR.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

# --- District ----------------------------------------------------------------
DISTRICT_ID = "narimanov"
DISTRICT_NAME = "Nərimanov rayonu"
DISTRICT_NAME_EN = "Narimanov District"
# Real OSM relation used to source the boundary (admin_level 7, Baku).
OSM_RELATION_ID = 11827003
# Map starting view (centroid of the real boundary).
MAP_CENTER = {"lon": 49.8805, "lat": 40.4178}
MAP_ZOOM = 13

# --- Risk model weights (must sum to ~1.0) -----------------------------------
# Risk score (0-100) = 100 * weighted blend of normalized factors per catchment.
# Built purely from real physical drivers (DEM + OSM surface); no synthetic inputs.
RISK_WEIGHTS = {
    "imperviousness": 0.33,   # more asphalt/roofs -> more runoff
    "sink": 0.28,             # low-lying / depression where water pools
    "upstream_area": 0.22,    # large catchment draining into this cell
    "low_slope": 0.17,        # flat ground drains slowly
}

# Risk-score bands for colouring + labels.
RISK_BANDS = [
    (75, "critical"),
    (55, "high"),
    (35, "moderate"),
    (0, "low"),
]

# --- Rational Method ---------------------------------------------------------
# Q (m3/s) = RATIONAL_K * C * i(mm/h) * A(ha)
RATIONAL_K = 0.00278
# Runoff coefficient C is derived from imperviousness fraction (0..1):
#   C = C_MIN + (C_MAX - C_MIN) * imperviousness
C_MIN = 0.20  # vegetated / pervious ground
C_MAX = 0.95  # fully sealed surface

# --- Dispatch trigger --------------------------------------------------------
# A hotspot raises a preventive work-order when forecast peak runoff exceeds
# this fraction of its required design capacity, OR forecast intensity exceeds
# the absolute storm threshold below.
DISPATCH_RUNOFF_FRACTION = 0.85
STORM_INTENSITY_MM_H = 20.0     # intensity that puts the district on alert
FORECAST_HORIZON_HOURS = 6      # how far ahead we look for the headline trigger
# How many forecast days to expose for day-by-day simulation. Open-Meteo serves
# hourly precipitation up to 16 days ahead for free — we take the full horizon.
FORECAST_DAYS = 16

# Design storm used to compute each hotspot's *required* capacity (the spec the
# drainage there should meet). Baku ~ a 10-year, 1-hour design intensity.
DESIGN_STORM_MM_H = 45.0

# --- Open-Meteo --------------------------------------------------------------
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_TIMEOUT_S = 8.0


def risk_band(score: float) -> str:
    """Map a 0-100 risk score to a severity band label."""
    for threshold, label in RISK_BANDS:
        if score >= threshold:
            return label
    return "low"


def runoff_coefficient(imperviousness: float) -> float:
    """Convert an imperviousness fraction (0..1) to a Rational-Method C."""
    imperviousness = max(0.0, min(1.0, imperviousness))
    return C_MIN + (C_MAX - C_MIN) * imperviousness
