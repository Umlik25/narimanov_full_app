"""Download OSM building footprints + road network for Narimanov District.

These are the real impervious surfaces (roofs + paved roads) from which osm_surface.py
computes a true imperviousness fraction per catchment cell — the runoff coefficient C.

Source: OpenStreetMap via Overpass API (free, no key). Saved to data/raw/osm_surface.json.

Usage:  python data/pipeline/fetch_osm_surface.py
"""
from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from service import config  # noqa: E402

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def boundary_bbox():
    raw = json.loads((config.RAW_DIR / "narimanov_boundary_raw.json").read_text())
    geom = raw["geometry"] if raw.get("type") == "Feature" else raw
    xs, ys = [], []
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        for x, y in poly[0]:
            xs.append(x)
            ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def main():
    min_lon, min_lat, max_lon, max_lat = boundary_bbox()
    bbox = f"{min_lat},{min_lon},{max_lat},{max_lon}"  # S,W,N,E
    query = (
        "[out:json][timeout:120];"
        f"(way[\"building\"]({bbox});"
        f"way[\"highway\"]({bbox}););"
        "out geom;"
    )
    data = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(
        OVERPASS_URL, data=data, headers={"User-Agent": "AquaWatch/1.0 (hackathon)"}
    )
    print("Querying Overpass for buildings + roads ...")
    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = resp.read()
    out = config.RAW_DIR / "osm_surface.json"
    out.write_bytes(payload)
    elements = json.loads(payload).get("elements", [])
    nb = sum(1 for e in elements if e.get("tags", {}).get("building"))
    nr = sum(1 for e in elements if e.get("tags", {}).get("highway"))
    print(f"Wrote {out.relative_to(ROOT)} — {nb} buildings, {nr} roads ({len(payload)} bytes)")


if __name__ == "__main__":
    main()
