"""Compute a real imperviousness fraction per catchment cell from OSM data.

Imperviousness drives the Rational-Method runoff coefficient C. We measure the
sealed surface inside each grid cell as:

    impervious_area = sum(building footprint areas) + sum(road length * road width)

then fraction = impervious_area / cell_area, plus a small allowance for unmapped
paving (yards, parking, pavements). The geometry maths use a local equirectangular
projection to metres — accurate at city scale and dependency-free.
"""
from __future__ import annotations

import json
import math
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from service import config  # noqa: E402

# Typical carriageway widths (metres) by OSM highway class.
ROAD_WIDTH = {
    "motorway": 14, "trunk": 12, "primary": 11, "secondary": 9, "tertiary": 7.5,
    "residential": 6, "living_street": 5, "unclassified": 6, "service": 4,
    "pedestrian": 5, "footway": 2, "path": 1.5, "cycleway": 2, "steps": 1.5,
}
DEFAULT_ROAD_WIDTH = 5.0
# Allowance for paving OSM doesn't map (driveways, lots, sidewalks).
UNMAPPED_PAVING = 0.08
IMPERV_MIN, IMPERV_MAX = 0.05, 0.95


def _m_per_deg(lat: float):
    return (111_320.0 * math.cos(math.radians(lat)), 110_574.0)  # (lon, lat)


def _poly_area_m2(coords, lat0: float) -> float:
    """Shoelace area in m^2 for a ring of {lon,lat} points via local projection."""
    mlon, mlat = _m_per_deg(lat0)
    pts = [((p["lon"]) * mlon, (p["lat"]) * mlat) for p in coords]
    area = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0


def _centroid(coords):
    n = len(coords)
    return (sum(p["lon"] for p in coords) / n, sum(p["lat"] for p in coords) / n)


def _seg_len_m(a, b, lat0: float) -> float:
    mlon, mlat = _m_per_deg(lat0)
    return math.hypot((b["lon"] - a["lon"]) * mlon, (b["lat"] - a["lat"]) * mlat)


def compute_imperviousness(min_lon: float, min_lat: float, step: float):
    """Compute per-cell surface metrics aligned to generate.py's grid.

    Returns (imperviousness_map, street_map, cell_area_m2) where:
      * imperviousness_map  {(col,row): fraction 0..1}
      * street_map          {(col,row): dominant named road in that cell}
    """
    elements = json.loads((config.RAW_DIR / "osm_surface.json").read_text())["elements"]

    def cell_of(lon, lat):
        return (int((lon - min_lon) // step), int((lat - min_lat) // step))

    impervious_m2 = defaultdict(float)
    street_len = defaultdict(lambda: defaultdict(float))  # cell -> {name: length}

    for el in elements:
        geom = el.get("geometry")
        if not geom:
            continue
        tags = el.get("tags", {})
        if tags.get("building"):
            lon0, lat0 = _centroid(geom)
            area = _poly_area_m2(geom, lat0)
            impervious_m2[cell_of(lon0, lat0)] += area
        elif tags.get("highway"):
            width = ROAD_WIDTH.get(tags["highway"], DEFAULT_ROAD_WIDTH)
            name = tags.get("name")
            for a, b in zip(geom, geom[1:]):
                mid_lon = (a["lon"] + b["lon"]) / 2
                mid_lat = (a["lat"] + b["lat"]) / 2
                length = _seg_len_m(a, b, mid_lat)
                cell = cell_of(mid_lon, mid_lat)
                impervious_m2[cell] += length * width
                if name:
                    street_len[cell][name] += length

    # cell area in m^2 (uniform enough across this small district)
    mlon, mlat = _m_per_deg(min_lat + step)
    cell_area_m2 = (step * mlon) * (step * mlat)

    imperv = {}
    for cell, area in impervious_m2.items():
        frac = UNMAPPED_PAVING + area / cell_area_m2
        imperv[cell] = round(max(IMPERV_MIN, min(IMPERV_MAX, frac)), 3)

    streets = {cell: max(names, key=names.get) for cell, names in street_len.items()}
    return imperv, streets, cell_area_m2


if __name__ == "__main__":
    # Quick stats against the real grid parameters.
    import statistics
    from generate import GRID_STEP_DEG, bbox, load_boundary  # type: ignore

    geom = load_boundary()
    min_lon, min_lat, _, _ = bbox(geom)
    frac, streets, area = compute_imperviousness(min_lon, min_lat, GRID_STEP_DEG)
    vals = list(frac.values())
    print(f"cells with OSM surface: {len(vals)}  named streets: {len(streets)}  "
          f"cell_area={area/10000:.1f} ha")
    print(f"imperviousness min/mean/max: "
          f"{min(vals):.2f} / {statistics.mean(vals):.2f} / {max(vals):.2f}")
