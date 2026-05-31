"""Loads precomputed GeoJSON layers once and keeps them in memory."""
from __future__ import annotations

import json
from functools import lru_cache
from typing import Dict, List

from . import config

_LAYER_FILES = {
    "district": "district.geojson",
    "catchments": "catchments.geojson",
    "flow": "flow.geojson",
    "hotspots": "hotspots.geojson",
}


@lru_cache(maxsize=None)
def _load(name: str) -> dict:
    path = config.PROCESSED_DIR / _LAYER_FILES[name]
    if not path.exists():
        raise FileNotFoundError(
            f"Missing processed layer '{name}' ({path}). "
            f"Run: python water-management/flood-intelligence/data/pipeline/generate.py"
        )
    return json.loads(path.read_text())


def layer_names() -> List[str]:
    return list(_LAYER_FILES.keys())


def get_layer(name: str) -> dict:
    if name not in _LAYER_FILES:
        raise KeyError(name)
    return _load(name)


def hotspots() -> List[Dict]:
    out = []
    for feat in _load("hotspots")["features"]:
        props = dict(feat["properties"])
        props["lon"], props["lat"] = feat["geometry"]["coordinates"]
        out.append(props)
    out.sort(key=lambda item: item.get("rank", 0))
    return out


def hotspot(hotspot_id: str) -> Dict | None:
    for item in hotspots():
        if item["id"] == hotspot_id:
            return item
    return None


def catchments() -> List[Dict]:
    out = []
    for feat in _load("catchments")["features"]:
        props = dict(feat["properties"])
        props["geometry"] = feat["geometry"]
        out.append(props)
    out.sort(key=lambda item: item.get("risk", 0.0), reverse=True)
    return out

