"""AquaWatch FastAPI microservice.

Serves precomputed flood-intelligence layers for Narimanov District plus the live
forecast -> preventive-dispatch engine. Designed to be merged into OpenWave: the
main app consumes these endpoints; dispatch work-orders flow into its task queue.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config, data_store, dispatch, forecast
from .models import (
    DispatchResponse,
    ForecastResponse,
    SimulateRequest,
    SimulateResponse,
)

app = FastAPI(
    title="AquaWatch — Flood Intelligence Layer",
    description="Predictive flood & drainage intelligence for Narimanov District (OpenWave).",
    version="0.1.0",
)

# Open CORS so the OpenWave frontend (any origin during the hackathon) can call us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "district": config.DISTRICT_ID, "layers": data_store.layer_names()}


@app.get("/api/district")
def get_district():
    return data_store.get_layer("district")


@app.get("/api/layers/{name}")
def get_layer(name: str):
    try:
        return data_store.get_layer(name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown layer '{name}'")


@app.get("/api/hotspots")
def get_hotspots():
    return {"district": config.DISTRICT_ID, "hotspots": data_store.hotspots()}


@app.get("/api/hotspots/{hotspot_id}")
def get_hotspot(hotspot_id: str):
    h = data_store.hotspot(hotspot_id)
    if h is None:
        raise HTTPException(status_code=404, detail=f"Unknown hotspot '{hotspot_id}'")
    return h


@app.get("/api/forecast", response_model=ForecastResponse)
async def get_forecast():
    fc = await forecast.fetch_forecast()
    fc["storm"] = forecast.is_storm(fc)
    return fc


@app.post("/api/simulate", response_model=SimulateResponse)
def post_simulate(req: SimulateRequest):
    rows = dispatch.evaluate(req.intensity_mm_h)
    catchments = dispatch.evaluate_catchments(req.intensity_mm_h)
    return {
        "intensity_mm_h": req.intensity_mm_h,
        "duration_h": req.duration_h,
        "storm": req.intensity_mm_h >= config.STORM_INTENSITY_MM_H,
        "triggered_count": sum(1 for r in rows if r["triggered"]),
        "flooded_catchments": sum(1 for c in catchments if c["flooded"]),
        "hotspots": rows,
        "catchments": catchments,
    }


@app.post("/api/dispatch/preview", response_model=DispatchResponse)
def post_dispatch_preview(req: SimulateRequest):
    """The hero call: preventive work-orders that *would* be created for this storm.

    After merge into OpenWave this becomes POST /api/dispatch and writes the orders
    into the main task lifecycle instead of just returning them.
    """
    return dispatch.build_work_orders(req.intensity_mm_h, req.duration_h)


@app.get("/")
def index():
    return JSONResponse({
        "service": "AquaWatch",
        "district": config.DISTRICT_NAME_EN,
        "viewer": "/viewer/",
        "docs": "/docs",
    })


# Standalone demo viewer (the wow). Mounted last so /api/* takes precedence.
app.mount("/viewer", StaticFiles(directory=str(config.ROOT_DIR / "viewer"), html=True), name="viewer")
