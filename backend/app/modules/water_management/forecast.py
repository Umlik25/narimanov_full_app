"""Rainfall forecast for the district."""
from __future__ import annotations

from datetime import date, datetime
from typing import Dict, List, Optional

import httpx

from . import config

_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def fetch_forecast(
    hours: int = config.FORECAST_HORIZON_HOURS,
    days: int = config.FORECAST_DAYS,
    timeout_s: float = 3.0,
) -> Dict:
    params = {
        "latitude": config.MAP_CENTER["lat"],
        "longitude": config.MAP_CENTER["lon"],
        "hourly": "precipitation",
        "forecast_days": days,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=timeout_s) as client:
            resp = await client.get(config.OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        all_times = data["hourly"]["time"]
        all_precip = data["hourly"]["precipitation"]
        summary = _summarize(all_times[:hours], all_precip[:hours], source="open-meteo")
        summary["days"] = _daily_breakdown(all_times, all_precip)
        return summary
    except Exception as exc:  # noqa: BLE001 - keep the demo resilient
        return {
            "source": "fallback",
            "error": str(exc),
            "horizon_hours": hours,
            "peak_intensity_mm_h": 0.0,
            "total_mm": 0.0,
            "series": [],
            "days": [],
        }


def _daily_breakdown(times: List[str], precip: List[float]) -> List[Dict]:
    by_day: Dict[str, List] = {}
    for t, p in zip(times, precip):
        day = t[:10]
        by_day.setdefault(day, []).append((t, p or 0.0))

    days: List[Dict] = []
    today = date.today().isoformat()
    for day, rows in sorted(by_day.items()):
        peak_t, peak_v = max(rows, key=lambda r: r[1])
        d = datetime.strptime(day, "%Y-%m-%d").date()
        label = "Today" if day == today else _WEEKDAYS[d.weekday()]
        days.append(
            {
                "date": day,
                "label": label,
                "short": d.strftime("%d %b"),
                "peak_intensity_mm_h": round(peak_v, 1),
                "total_mm": round(sum(p for _, p in rows), 1),
                "peak_time": peak_t[11:16],
                "storm": peak_v >= config.STORM_INTENSITY_MM_H,
            }
        )
    return days


def _summarize(times: List[str], precip: List[float], source: str) -> Dict:
    series = [{"hour": t, "precipitation_mm": p} for t, p in zip(times, precip)]
    peak = max(precip) if precip else 0.0
    return {
        "source": source,
        "horizon_hours": len(precip),
        "peak_intensity_mm_h": round(peak, 1),
        "total_mm": round(sum(precip), 1),
        "storm": peak >= config.STORM_INTENSITY_MM_H,
        "series": series,
    }


def scenario_forecast(intensity_mm_h: float, duration_h: int) -> Dict:
    series = [
        {"hour": h, "precipitation_mm": round(intensity_mm_h, 1)}
        for h in range(duration_h)
    ]
    return {
        "source": "scenario",
        "horizon_hours": duration_h,
        "peak_intensity_mm_h": round(intensity_mm_h, 1),
        "total_mm": round(intensity_mm_h * duration_h, 1),
        "series": series,
    }


def is_storm(forecast: Dict) -> bool:
    return forecast.get("peak_intensity_mm_h", 0.0) >= config.STORM_INTENSITY_MM_H


def resolve_intensity(
    forecast: Optional[Dict],
    intensity_mm_h: Optional[float],
) -> float:
    if intensity_mm_h is not None:
        return intensity_mm_h
    if forecast is not None:
        return forecast.get("peak_intensity_mm_h", 0.0)
    return 0.0
