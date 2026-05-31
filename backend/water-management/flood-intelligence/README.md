# AquaWatch — Flood Intelligence Layer for OpenWave

Predictive flood & drainage intelligence for **Narimanov District, Baku**. A
standalone Python (FastAPI) microservice that plugs into the OpenWave urban-problem
platform.

> **Pitch:** We don't just record floods *after* the rain — we predict where
> Narimanov will flood *before* the next storm, and auto-dispatch preventive
> work-orders to the right utility crews.

See [CLAUDE.md](CLAUDE.md) for the full design, model, and 5-minute demo script.

## Quickstart

```bash
cd flood-intelligence
bash scripts/run.sh
# open http://localhost:8000/viewer/
```

Drag the **rainfall slider** (or hit the *Fırtına 35* / *Aprel 2026 · 90* presets):
the risk map lights up and preventive work-orders appear in the sidebar — generated
before a drop falls.

## What it does

- Real OSM Narimanov boundary + a micro-catchment grid.
- Per-catchment **risk score** = satellite imperviousness + terrain low-points
  (D8 flow accumulation) + upstream catchment + low slope + complaint history.
- **Required drainage capacity** per zone via the **Rational Method**
  (`Q = 0.00278·C·i·A`).
- Live **Open-Meteo** forecast → **preventive dispatch**: which crews, where, what,
  by when — before the storm.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness |
| GET | `/api/district` | Narimanov boundary |
| GET | `/api/layers/{name}` | `catchments` \| `flow` \| `hotspots` \| `district` |
| GET | `/api/hotspots` | ranked hotspots + recommended actions |
| GET | `/api/forecast` | live Open-Meteo forecast |
| POST | `/api/simulate` | per-hotspot load for a `{intensity_mm_h,duration_h}` storm |
| POST | `/api/dispatch/preview` | preventive work-orders for that storm (**hero call**) |

## Data is real (open data)

| Layer | Source |
|---|---|
| Boundary | OSM relation 11827003 |
| Elevation / flow / low-points | AWS Terrarium DEM tiles |
| Imperviousness (sealed surface) | OSM buildings + roads (Overpass) |
| Live rainfall | Open-Meteo (no key) |
| Citizen complaints | placeholder until OpenWave report DB is connected |

### Regenerating from source (optional)

```bash
pip install -r requirements-pipeline.txt   # Pillow + numpy, no GDAL
python data/pipeline/fetch_boundary.py      # OSM boundary  -> data/raw/
python data/pipeline/fetch_terrain.py       # Terrarium DEM -> data/raw/terrain/
python data/pipeline/fetch_osm_surface.py   # OSM buildings+roads -> data/raw/
python data/pipeline/generate.py            # -> data/processed/*.geojson
```

The runtime service only ever reads `data/processed/` (committed). Heavy geo
libraries (GDAL/rasterio) are **not** runtime dependencies — see
[requirements-pipeline.txt](requirements-pipeline.txt).

## Honesty note (for Q&A)

We estimate the **required** drainage capacity and flag risk. We compute a real
capacity **gap** only where the water utility supplies actual pipe data. We do not
claim live satellite flood detection — satellite/terrain data is the *evidence* for
*why* a zone is risky.
