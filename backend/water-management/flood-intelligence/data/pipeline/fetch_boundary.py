"""Fetch the real Narimanov district boundary from OpenStreetMap.

Writes data/raw/narimanov_boundary_raw.json (a MultiPolygon geometry). This makes
the boundary reproducible; the committed processed layers already embed it, so the
runtime service does not need this script.

Usage:  python data/pipeline/fetch_boundary.py
"""
from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from service import config  # noqa: E402

# OSM polygon service returns relation geometry directly as GeoJSON.
URL = f"https://polygons.openstreetmap.fr/get_geojson.py?id={config.OSM_RELATION_ID}&params=0"


def main():
    config.RAW_DIR.mkdir(parents=True, exist_ok=True)
    out = config.RAW_DIR / "narimanov_boundary_raw.json"
    req = urllib.request.Request(URL, headers={"User-Agent": "AquaWatch/1.0 (hackathon)"})
    print(f"Fetching OSM relation {config.OSM_RELATION_ID} ...")
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = resp.read()
    out.write_bytes(data)
    print(f"Wrote {out.relative_to(ROOT)} ({len(data)} bytes)")
    print("Next: python data/pipeline/generate.py")


if __name__ == "__main__":
    main()
