"""Central configuration for the water-management module."""
from __future__ import annotations

from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parent
APP_DIR = SERVICE_DIR.parents[1]
ROOT_DIR = SERVICE_DIR.parents[2]
DATA_DIR = ROOT_DIR / "water-management" / "flood-intelligence" / "data"
PROCESSED_DIR = DATA_DIR / "processed"

DISTRICT_ID = "narimanov"
DISTRICT_NAME = "Nərimanov rayonu"
DISTRICT_NAME_EN = "Narimanov District"
MAP_CENTER = {"lon": 49.8805, "lat": 40.4178}
MAP_ZOOM = 13

RISK_WEIGHTS = {
    "imperviousness": 0.33,
    "sink": 0.28,
    "upstream_area": 0.22,
    "low_slope": 0.17,
}

RISK_BANDS = [
    (75, "critical"),
    (55, "high"),
    (35, "moderate"),
    (0, "low"),
]

RATIONAL_K = 0.00278
C_MIN = 0.20
C_MAX = 0.95
DESIGN_STORM_MM_H = 45.0
STORM_INTENSITY_MM_H = 20.0
FORECAST_HORIZON_HOURS = 6
FORECAST_DAYS = 16
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def risk_band(score: float) -> str:
    for threshold, label in RISK_BANDS:
        if score >= threshold:
            return label
    return "low"


def runoff_coefficient(imperviousness: float) -> float:
    imperviousness = max(0.0, min(1.0, imperviousness))
    return C_MIN + (C_MAX - C_MIN) * imperviousness
