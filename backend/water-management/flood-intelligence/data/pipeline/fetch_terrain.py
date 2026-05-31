"""Download a real Digital Elevation Model for Narimanov District.

Source: AWS "Terrain Tiles" open dataset (Mapzen/Copernicus/SRTM blend), Terrarium
RGB-PNG encoding — free, no API key. Each pixel encodes elevation as:

    elevation_m = (R * 256 + G + B / 256) - 32768

We fetch the web-mercator tiles covering the district bbox at a fixed zoom and save
them to data/raw/terrain/ plus a small index. terrain.py samples elevation from them.

Usage:  python data/pipeline/fetch_terrain.py
"""
from __future__ import annotations

import json
import math
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from service import config  # noqa: E402

ZOOM = 13  # ~19 m/px at lat 40 — ample for slope on ~400 m catchment cells
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
MARGIN_DEG = 0.01  # pad the bbox so edge cells have neighbours


def lonlat_to_tile(lon: float, lat: float, z: int):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y


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
    out_dir = config.RAW_DIR / "terrain"
    out_dir.mkdir(parents=True, exist_ok=True)
    min_lon, min_lat, max_lon, max_lat = boundary_bbox()
    min_lon -= MARGIN_DEG; min_lat -= MARGIN_DEG
    max_lon += MARGIN_DEG; max_lat += MARGIN_DEG

    x0, _ = lonlat_to_tile(min_lon, max_lat, ZOOM)
    x1, _ = lonlat_to_tile(max_lon, min_lat, ZOOM)
    _, y0 = lonlat_to_tile(min_lon, max_lat, ZOOM)
    _, y1 = lonlat_to_tile(max_lon, min_lat, ZOOM)
    xa, xb = int(math.floor(x0)), int(math.floor(x1))
    ya, yb = int(math.floor(y0)), int(math.floor(y1))

    tiles = []
    for x in range(xa, xb + 1):
        for y in range(ya, yb + 1):
            url = TILE_URL.format(z=ZOOM, x=x, y=y)
            dest = out_dir / f"{ZOOM}_{x}_{y}.png"
            req = urllib.request.Request(url, headers={"User-Agent": "AquaWatch/1.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                dest.write_bytes(resp.read())
            tiles.append({"x": x, "y": y})
            print(f"  tile z{ZOOM}/{x}/{y}")

    index = {"zoom": ZOOM, "tile_size": 256, "tiles": tiles}
    (out_dir / "terrain_index.json").write_text(json.dumps(index))
    print(f"Wrote {len(tiles)} tiles + index to {out_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
