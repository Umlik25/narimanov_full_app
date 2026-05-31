"""Loads the precomputed GeoJSON layers once at startup and keeps them in memory.

The runtime service is read-only over these files (see CLAUDE.md §2.1).
"""
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
            f"Run: python data/pipeline/generate.py"
        )
    return json.loads(path.read_text())


def layer_names() -> List[str]:
    return list(_LAYER_FILES.keys())


def get_layer(name: str) -> dict:
    if name not in _LAYER_FILES:
        raise KeyError(name)
    return _load(name)


def hotspots() -> List[Dict]:
    """List of hotspot property dicts (with their coordinates attached)."""
    out = []
    for feat in _load("hotspots")["features"]:
        props = dict(feat["properties"])
        props["lon"], props["lat"] = feat["geometry"]["coordinates"]
        out.append(props)
    return out


def hotspot(hotspot_id: str) -> Dict | None:
    for h in hotspots():
        if h["id"] == hotspot_id:
            return h
    return None
