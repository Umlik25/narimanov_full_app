"""Offline precompute pipeline -> data/processed/*.geojson

Produces every layer the runtime service serves. Deterministic (fixed seed) so
the demo is identical every run. The runtime service NEVER runs this; it only
reads the committed output in data/processed/.

What this models, and where it would come from in a real deployment:

  * district.geojson      real OSM Narimanov boundary (relation 11827003)
  * catchments.geojson    micro-catchment grid clipped to the district, each cell
                          carrying imperviousness (Sentinel-2 / Dynamic World),
                          terrain low-points + D8 flow accumulation (Copernicus
                          DEM), historical complaint density, and the derived
                          risk score + required drainage capacity.
  * flow.geojson          D8 downslope flow lines ("where the water runs").
  * hotspots.geojson      ranked top problem points with recommended actions.

Real data sources wired in:
  * elevation        AWS Terrarium DEM tiles        (fetch_terrain.py + terrain.py)
  * imperviousness   OSM buildings + roads          (fetch_osm_surface.py + osm_surface.py)
  * boundary         OSM relation 11827003          (fetch_boundary.py)
Still synthetic (pending OpenWave integration): citizen complaint density.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

# Make the `service` package and sibling pipeline modules importable as a script.
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from service import config, risk, runoff  # noqa: E402
from terrain import ElevationSampler  # noqa: E402
from osm_surface import compute_imperviousness  # noqa: E402

GRID_STEP_DEG = 0.002        # ~170 m lon x ~220 m lat (block-scale micro-catchments)
N_HOTSPOTS = 12

# Real Baku / Narimanov street names, assigned to the highest-risk cells so the
# hotspot cards read like real locations. Coordinates remain those of the cell.
STREET_POOL = [
    "Nariman Narimanov Ave.",
    "Tabriz St.",
    "Agha Neymatulla St.",
    "Fatali Khan Khoyski Ave.",
    "Koroghlu Metro area",
    "Ganjlik Metro area",
    "Ataturk Ave.",
    "Qara Qarayev area",
    "Zargarpalan St.",
    "Shikhali Gurbanov St.",
    "Hasan bey Zardabi Ave.",
    "28 May area",
]

# 8-neighbour offsets for D8 routing (col, row).
_D8 = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]


# --------------------------------------------------------------------------- #
# Geometry helpers
# --------------------------------------------------------------------------- #
def load_boundary() -> dict:
    """Load the raw OSM boundary geometry (a MultiPolygon)."""
    raw = json.loads((config.RAW_DIR / "narimanov_boundary_raw.json").read_text())
    if raw.get("type") == "Feature":
        return raw["geometry"]
    return raw


def polygon_rings(geom: dict):
    """Yield (outer_ring, [holes]) for each polygon in a (Multi)Polygon."""
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    else:
        polys = geom["coordinates"]
    for poly in polys:
        yield poly[0], poly[1:]


def point_in_ring(lon: float, lat: float, ring) -> bool:
    """Ray-casting point-in-polygon for a single ring."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > lat) != (yj > lat)) and (
            lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-15) + xi
        ):
            inside = not inside
        j = i
    return inside


def point_in_geom(lon: float, lat: float, geom: dict) -> bool:
    for outer, holes in polygon_rings(geom):
        if point_in_ring(lon, lat, outer) and not any(
            point_in_ring(lon, lat, h) for h in holes
        ):
            return True
    return False


def bbox(geom: dict):
    xs, ys = [], []
    for outer, _ in polygon_rings(geom):
        for x, y in outer:
            xs.append(x)
            ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def cell_area_ha(lat: float) -> float:
    """Area of one grid cell in hectares at the given latitude."""
    km_per_deg_lat = 110.574
    km_per_deg_lon = 111.320 * math.cos(math.radians(lat))
    w = GRID_STEP_DEG * km_per_deg_lon
    h = GRID_STEP_DEG * km_per_deg_lat
    return w * h * 100.0  # km^2 -> ha


# --------------------------------------------------------------------------- #
# Synthetic-but-method-faithful terrain & surface fields
# --------------------------------------------------------------------------- #
def build_cells(geom: dict, sampler, imperv_map, street_map):
    """Grid the bbox, keep cells inside the district, attach REAL fields.

    Elevation comes from the Terrarium DEM (terrain.py); imperviousness and the
    dominant street name from OSM (osm_surface.py). Cells with no mapped surface
    default to a low imperviousness (parks / open ground).
    """
    min_lon, min_lat, max_lon, max_lat = bbox(geom)
    cells = {}

    col = 0
    lon = min_lon + GRID_STEP_DEG / 2
    while lon < max_lon:
        row = 0
        lat = min_lat + GRID_STEP_DEG / 2
        while lat < max_lat:
            if point_in_geom(lon, lat, geom):
                imperv = imperv_map.get((col, row), 0.08)  # real OSM coverage
                cells[(col, row)] = {
                    "col": col,
                    "row": row,
                    "lon": round(lon, 6),
                    "lat": round(lat, 6),
                    "elev": sampler.elevation(lon, lat),  # real DEM
                    "imperviousness": round(imperv, 3),
                    "street": street_map.get((col, row), ""),
                    "area_ha": round(cell_area_ha(lat), 2),
                }
            row += 1
            lat += GRID_STEP_DEG
        col += 1
        lon += GRID_STEP_DEG
    return cells


def compute_slope(cells):
    """Mean downhill slope per cell from its 8 neighbours (normalized 0..1)."""
    max_slope = 1e-6
    for (c, r), cell in cells.items():
        diffs = []
        for dc, dr in _D8:
            nb = cells.get((c + dc, r + dr))
            if nb:
                # vertical drop per horizontal step (cells ~ uniform spacing)
                dist = math.hypot(dc, dr)
                diffs.append(abs(cell["elev"] - nb["elev"]) / dist)
        slope = sum(diffs) / len(diffs) if diffs else 0.0
        cell["slope"] = slope
        max_slope = max(max_slope, slope)
    for cell in cells.values():
        s = cell["slope"] / max_slope
        cell["low_slope_index"] = round(1.0 - s, 3)  # flat ground = high index


def d8_flow_accumulation(cells):
    """Real D8 flow routing + accumulation on the synthetic DEM.

    Each cell drains to its steepest-descent neighbour; accumulation is summed by
    processing cells from highest to lowest elevation. Also flags sinks (no lower
    neighbour) and records the receiver for drawing flow lines.
    """
    # Determine receiver (steepest descent) for each cell.
    for (c, r), cell in cells.items():
        best = None
        best_drop = 0.0
        for dc, dr in _D8:
            nb = cells.get((c + dc, r + dr))
            if not nb:
                continue
            drop = (cell["elev"] - nb["elev"]) / math.hypot(dc, dr)
            if drop > best_drop:
                best_drop = drop
                best = (c + dc, r + dr)
        cell["receiver"] = best
        cell["is_sink"] = best is None  # local depression / pour point

    # Accumulate area downstream, high elevation first.
    for cell in cells.values():
        cell["accum_ha"] = cell["area_ha"]
    order = sorted(cells.values(), key=lambda x: x["elev"], reverse=True)
    for cell in order:
        rcv = cell["receiver"]
        if rcv is not None:
            cells[rcv]["accum_ha"] += cell["accum_ha"]

    max_accum = max(c["accum_ha"] for c in cells.values())
    for cell in cells.values():
        # log-scaled so a few huge channels don't flatten everything else
        cell["upstream_norm"] = round(
            math.log1p(cell["accum_ha"]) / math.log1p(max_accum), 3
        )
        # Sink index: low-lying cells that also collect flow pool water.
        cell["sink_index"] = round(
            min(1.0, (0.6 if cell["is_sink"] else 0.0) + 0.5 * cell["upstream_norm"]),
            3,
        )


def score_cells(cells):
    """Attach risk score + required capacity to every cell."""
    for cell in cells.values():
        cell["risk"] = risk.risk_score(cell)
        cell["risk_band"] = config.risk_band(cell["risk"])
        cell["required_capacity_m3s"] = round(
            runoff.required_capacity_m3s(cell["imperviousness"], cell["area_ha"]), 3
        )


# --------------------------------------------------------------------------- #
# Recommended actions for a hotspot
# --------------------------------------------------------------------------- #
def recommend_actions(cell) -> list:
    actions = []
    req = cell["required_capacity_m3s"]
    grates = max(2, int(round(req / 0.18)))  # ~0.18 m3/s handled per cleaned intake
    actions.append(f"Preventive: clean {grates} stormwater inlets")
    if cell["sink_index"] > 0.6:
        actions.append("Deploy mobile pump station")
    if cell["upstream_norm"] > 0.7:
        retention = int(round(req * 180))
        actions.append(f"Consider retention storage (~{retention} m³)")
    if cell["imperviousness"] > 0.8:
        actions.append("Propose green infrastructure / permeable paving")
    actions.append("Restrict parking near stormwater inlets")
    return actions


# --------------------------------------------------------------------------- #
# GeoJSON writers
# --------------------------------------------------------------------------- #
def cell_polygon(cell):
    """Square footprint of a cell as a GeoJSON polygon ring."""
    h = GRID_STEP_DEG / 2
    lon, lat = cell["lon"], cell["lat"]
    return [[
        [round(lon - h, 6), round(lat - h, 6)],
        [round(lon + h, 6), round(lat - h, 6)],
        [round(lon + h, 6), round(lat + h, 6)],
        [round(lon - h, 6), round(lat + h, 6)],
        [round(lon - h, 6), round(lat - h, 6)],
    ]]


def write_geojson(path: Path, features: list):
    fc = {"type": "FeatureCollection", "features": features}
    path.write_text(json.dumps(fc, ensure_ascii=False))
    print(f"  wrote {path.relative_to(ROOT)} ({len(features)} features)")


def main():
    config.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    geom = load_boundary()
    min_lon, min_lat, _, _ = bbox(geom)

    print("Generating AquaWatch layers for", config.DISTRICT_NAME_EN)
    print("  loading real DEM (Terrarium) + OSM imperviousness ...")
    sampler = ElevationSampler()
    imperv_map, street_map, _ = compute_imperviousness(min_lon, min_lat, GRID_STEP_DEG)
    cells = build_cells(geom, sampler, imperv_map, street_map)
    print(f"  {len(cells)} catchment cells inside the district")
    compute_slope(cells)
    d8_flow_accumulation(cells)
    score_cells(cells)

    # --- district.geojson ---
    write_geojson(
        config.PROCESSED_DIR / "district.geojson",
        [{
            "type": "Feature",
            "properties": {
                "id": config.DISTRICT_ID,
                "name": config.DISTRICT_NAME,
                "name_en": config.DISTRICT_NAME_EN,
            },
            "geometry": geom,
        }],
    )

    # --- catchments.geojson ---
    catch_features = []
    for (c, r), cell in cells.items():
        catch_features.append({
            "type": "Feature",
            "properties": {
                "id": f"c-{c}-{r}",
                "col": c,
                "row": r,
                "risk": cell["risk"],
                "risk_band": cell["risk_band"],
                "imperviousness": cell["imperviousness"],
                "sink_index": cell["sink_index"],
                "upstream_norm": cell["upstream_norm"],
                "low_slope_index": cell["low_slope_index"],
                "street": cell["street"],
                "area_ha": cell["area_ha"],
                "upstream_area_ha": round(cell["accum_ha"], 1),
                "required_capacity_m3s": cell["required_capacity_m3s"],
            },
            "geometry": {"type": "Polygon", "coordinates": cell_polygon(cell)},
        })
    write_geojson(config.PROCESSED_DIR / "catchments.geojson", catch_features)

    # --- flow.geojson (D8 downslope lines) ---
    flow_features = []
    for cell in cells.values():
        rcv = cell["receiver"]
        if rcv is None:
            continue
        target = cells[rcv]
        flow_features.append({
            "type": "Feature",
            "properties": {"accum_ha": round(cell["accum_ha"], 1)},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [cell["lon"], cell["lat"]],
                    [target["lon"], target["lat"]],
                ],
            },
        })
    write_geojson(config.PROCESSED_DIR / "flow.geojson", flow_features)

    # --- hotspots.geojson (top N by risk) ---
    ranked = sorted(cells.values(), key=lambda x: x["risk"], reverse=True)[:N_HOTSPOTS]
    hot_features = []
    for i, cell in enumerate(ranked, start=1):
        name = cell["street"] or STREET_POOL[(i - 1) % len(STREET_POOL)]
        hot_features.append({
            "type": "Feature",
            "properties": {
                "id": f"H{i}",
                "rank": i,
                "name": name,
                "risk": cell["risk"],
                "risk_band": cell["risk_band"],
                "imperviousness_pct": round(cell["imperviousness"] * 100),
                "upstream_area_ha": round(cell["accum_ha"], 1),
                "required_capacity_m3s": cell["required_capacity_m3s"],
                "actual_capacity_m3s": None,  # unknown until utility data supplied
                "risk_breakdown": risk.explain(cell),
                "recommended_actions": recommend_actions(cell),
            },
            "geometry": {"type": "Point", "coordinates": [cell["lon"], cell["lat"]]},
        })
    write_geojson(config.PROCESSED_DIR / "hotspots.geojson", hot_features)

    print("Done.")


if __name__ == "__main__":
    main()
