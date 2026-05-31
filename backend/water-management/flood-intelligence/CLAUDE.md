# AquaWatch — Flood Intelligence Layer for OpenWave

> A standalone Python microservice that adds **predictive flood & drainage intelligence**
> to the OpenWave urban-problem platform for **Narimanov District, Baku**.
> Built to be developed independently and merged into the main OpenWave project at the end.

---

## 0. The one-sentence pitch (memorize this)

> **"We don't just record floods after the rain — we predict where Narimanov will flood
> *before* the next storm, and automatically dispatch preventive work-orders to the
> right utility crews."**

The hero feature is **Forecast → Risk → Auto-dispatch**, not "a satellite map".
The satellite/terrain data is the *evidence* for *why* each hotspot is risky.

---

## 1. Why this exists (maps directly to the hackathon case)

This module targets two requirements from `../docs/requirements_en.md` that competitors
will likely under-build:

- **Territorial problem #4 — Flooding** during intensive rainfall (`requirements_en.md:66`).
- **Functional requirement #10 — Coordination of communal & utility services**, with
  **preventive + operational measures** using **weather-forecast data** (`requirements_en.md:49-55`).

It also reuses, rather than duplicates, the platform-wide features that already exist in
the main OpenWave project:

- **#9 Automatic alerts** — we emit alerts when a storm threatens high-risk zones.
- **#8 Task assignment & status tracking** — we generate preventive work-orders that flow
  into the existing task lifecycle.
- **#5 Dashboard** — we expose analytics layers the dashboard renders.

### Scoring logic (why this wins points)

| Criterion (max) | How AquaWatch scores |
|---|---|
| Problem Solving & Relevance (20) | Directly solves the #1 real Narimanov pain: flooding from weak drainage. |
| Technical Implementation (30) | A real, running FastAPI service with precomputed geodata + live forecast + a polished viewer. **Must actually run in the demo.** |
| Innovation (15) | Predictive *preventive dispatch* from satellite-derived imperviousness + terrain + rain forecast. Not a reactive map. |
| UX/UI (15) | Clean MapLibre layers + hotspot cards that a non-technical official understands instantly. |
| Feasibility (10) | Core runs on **free/open data** (Sentinel-2, Copernicus DEM, Open-Meteo). Honest "required vs actual capacity" framing. |
| Presentation (10) | The 5-min demo script in §7 is built around one clean wow-moment. |

---

## 2. Hard-won design decisions (do NOT relitigate these)

These were decided deliberately. If tempted to "improve", re-read this first.

1. **Precompute ALL geodata offline into GeoJSON.** The demo serves static processed
   layers — nothing heavy runs live, nothing crashes on stage. Live calls are limited to
   the lightweight Open-Meteo forecast.
2. **No GDAL/rasterio/geopandas in the runtime service.** Runtime deps stay tiny
   (`fastapi`, `uvicorn`, `httpx`, `pydantic`). Heavy geo-processing lives only in the
   offline `data/pipeline/` scripts and is optional to run.
3. **Do NOT claim live satellite flood detection.** Sentinel-1 SAR is unreliable in dense
   urban areas at 10 m. We use satellite/terrain for **risk evidence** (imperviousness,
   low points, catchment), never "we detected this puddle from space".
4. **Required capacity, not actual capacity.** We estimate *required* drainage capacity via
   the Rational Method and flag the *gap*. We only compute a real gap where actual pipe
   data is supplied. Say this out loud in Q&A — honesty beats overclaim.
5. **Coarse rain sources (GPM 10 km, ERA5 9 km) are bigger than the whole district** — use
   them only as a single rainfall scalar for historical events, never for intra-district
   spatial variation. Live forecast = Open-Meteo (free, no key).

---

## 3. Data: what is REAL vs synthetic (be honest in Q&A)

| Layer | Status | Source | What it gives us |
|---|---|---|---|
| District boundary | ✅ **REAL** | OSM relation 11827003 (`fetch_boundary.py`) | True Narimanov polygon. |
| Terrain / low points / flow | ✅ **REAL** | AWS Terrarium DEM tiles (`fetch_terrain.py` + `terrain.py`) | Elevation → slope, sinks, D8 flow accumulation. |
| Imperviousness % | ✅ **REAL** | OSM buildings + roads (`fetch_osm_surface.py` + `osm_surface.py`) | Sealed-surface fraction → runoff coefficient `C`. |
| Live rain forecast | ✅ **REAL** | Open-Meteo (runtime, free, no key) | Drives the predictive trigger; auto-loads on open. 16-day hourly forecast → a per-day picker simulates any upcoming day from its real peak intensity. |
| Citizen complaints | ⚠️ **Synthetic** | placeholder, correlated with risk | Replace with OpenWave's real report DB after merge. |
| Historical rain events | (optional) | Open-Meteo Archive / GPM IMERG | Single mm/h scalar for past floods (e.g. Apr 2026, ~90 mm). |

The *method* (D8 accumulation, Rational Method, weighted risk) is real and now runs on
real terrain, real buildings/roads, real boundary, and live rain. Only complaint density
is still a stand-in until the OpenWave report database is connected.

> Pipeline order (offline, raw inputs are gitignored and re-fetchable):
> `fetch_boundary.py` → `fetch_terrain.py` → `fetch_osm_surface.py` → `generate.py`.
> `generate.py` reads the real DEM + OSM surface and writes `data/processed/*.geojson`.
> The runtime service only ever reads `data/processed/` (committed).

---

## 4. The model (keep it explainable)

**Rational Method** (small urban catchments, SI form):

```
Q = 0.00278 · C · i · A
  Q = peak runoff (m³/s)
  C = runoff coefficient (0–1), from imperviousness
  i = rainfall intensity (mm/h), from forecast or scenario
  A = catchment area (hectares)
```

**Risk score** per micro-catchment (0–100), a weighted blend of real physical drivers:
`imperviousness` (0.33), `low-lying / sink` (0.28), `upstream catchment area` (0.22),
`low slope` (0.17). No synthetic inputs. Weights live in `service/config.py`.

**Grid**: ~200 m cells (`GRID_STEP_DEG = 0.002`) — block-scale micro-catchments, ~544
cells. Each cell also carries its dominant **OSM street name** for labelling.

**Forecast day picker** (the live map): `/api/forecast` returns a 7-day hourly forecast
collapsed to a per-day breakdown — each day's **peak hourly intensity** (mm/h, the value
that drives the flood model), the hour it peaks, and total depth. The viewer renders one chip
per day; picking a day simulates the dashboard from that day's *real* forecast peak. The
manual slider/presets remain as a "what-if" override (e.g. the April-2026 90 mm event). On
open we default to today's live forecast. Forecast horizon = the full free Open-Meteo
window (`config.FORECAST_DAYS = 16`); the chip row scrolls horizontally.

**Dynamic flood zones** (the live map): for the current rainfall `i`, each cell floods once
`i` passes its risk-derived activation threshold (high-risk cells flood at lower `i`). Zones
are the worst flooding **water-collection points** with spatial spacing (non-max suppression),
ranked by predicted runoff `Q`. They appear/grow as rain rises and never collapse into one
blob. Computed client-side for an instant slider; the same model exists server-side
(`/api/simulate`).

**Capacity gap** = `required_capacity (Q) − actual_capacity`. `actual_capacity` is only known
where utility pipe data is provided; otherwise we show *required* and label it an estimate.

**Dispatch** (server-side API, `dispatch.py` / `/api/dispatch/preview`): turns triggered zones
into preventive work-orders. Currently de-emphasised in the viewer; re-enable for the
"forecast → auto work-order" pitch.

---

## 5. Architecture

```
flood-intelligence/
├── CLAUDE.md                 # this file
├── README.md                 # quickstart
├── requirements.txt          # runtime deps (tiny)
├── requirements-pipeline.txt # optional heavy geo deps (offline only)
├── service/                  # FastAPI microservice (runtime)
│   ├── main.py               # app + routes
│   ├── config.py             # district id, weights, thresholds, coords
│   ├── models.py             # pydantic schemas (API contract)
│   ├── data_store.py         # loads data/processed/*.geojson once
│   ├── runoff.py             # Rational Method
│   ├── risk.py               # risk scoring
│   ├── forecast.py           # Open-Meteo client (+ scenario override)
│   └── dispatch.py           # forecast -> preventive work-orders
├── data/
│   ├── raw/                  # gitignored raw downloads
│   ├── processed/            # COMMITTED precomputed GeoJSON (served at runtime)
│   └── pipeline/             # offline generators + real-source how-to scripts
├── viewer/                   # standalone MapLibre demo page (the wow)
│   └── index.html
└── scripts/run.sh            # boot service + viewer
```

### API contract (consumed by the main OpenWave app)

- `GET  /health` — liveness.
- `GET  /api/district` — Narimanov boundary GeoJSON.
- `GET  /api/layers/{name}` — a processed layer (`hotspots`, `catchments`, `imperviousness`, `flow`).
- `GET  /api/hotspots` — ranked hotspots with risk, required capacity, recommended actions.
- `GET  /api/hotspots/{id}` — single hotspot detail card.
- `GET  /api/forecast` — live Open-Meteo forecast: headline (next-hours peak) + a `days[]`
  breakdown (per-day peak intensity, peak time, total depth) for the day picker.
- `POST /api/simulate` — run a rainfall scenario `{intensity_mm_h, duration_h}`; returns
  per-hotspot peak runoff + which cross threshold.
- `POST /api/dispatch/preview` — same as simulate but returns the preventive work-orders
  that *would* be created (this is the demo's hero call).

> Integration note: when merging into OpenWave, `dispatch.py` should POST work-orders to the
> main task API instead of returning them. Keep that boundary clean.

---

## 6. Conventions

- Python 3.9 compatible (system interpreter). Use a venv (`.venv/`, gitignored).
- Type hints + pydantic models for every endpoint. Keep functions small and pure where possible.
- All tunables (weights, thresholds, district coords) in `service/config.py` — never hardcode in logic.
- GeoJSON is the single interchange format. CRS = WGS84 (EPSG:4326), lon/lat order.
- Match the existing file's style when editing. Comment *why*, not *what*.
- Commit in small, meaningful steps. Branch off before touching anything shared at merge time.

---

## 7. The 5-minute demo script (build everything to serve this)

1. **(0:30) The problem.** "April 2026: ~90 mm on Absheron, 390% of the monthly norm.
   Narimanov flooded. Today the city reacts *after* the water rises."
2. **(1:00) The map.** Open the viewer. Narimanov with the risk heatmap + top-10 hotspots.
   Click hotspot #1 → card: 82% impervious, low-lying, 14 ha upstream, recurring complaints.
3. **(1:30) The science, briefly.** "Risk = satellite imperviousness + terrain low points +
   catchment + complaint history. For each we compute *required* drainage capacity by the
   Rational Method."
4. **(1:30) THE WOW.** Pull the rainfall forecast slider to "35 mm/h storm in 3 h". The map
   lights up red; a panel shows **auto-generated preventive work-orders** ("Crew B → clean 6
   grates at Hotspot #7 before 18:00; stage pump; restrict parking"). "These tasks just
   entered OpenWave's dispatch queue — *before* a single drop fell."
5. **(0:30) Honesty + close.** "Core runs on free open data. We estimate *required* capacity;
   with the water utility's pipe data we compute the real gap. We turn satellites and weather
   into a crew schedule that prevents the flood."

Anything that does not make this script land harder is out of scope for the hackathon.
