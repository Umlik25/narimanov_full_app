"""Flood-risk scoring helpers."""
from __future__ import annotations

from typing import Dict

from . import config

_FACTOR_KEYS = {
    "imperviousness": "imperviousness",
    "sink": "sink_index",
    "upstream_area": "upstream_norm",
    "low_slope": "low_slope_index",
}


def risk_score(props: Dict[str, float]) -> float:
    score = 0.0
    for factor, weight in config.RISK_WEIGHTS.items():
        value = float(props.get(_FACTOR_KEYS[factor], 0.0))
        score += weight * max(0.0, min(1.0, value))
    return round(score * 100.0, 1)


def explain(props: Dict[str, float]) -> Dict[str, float]:
    contributions: Dict[str, float] = {}
    for factor, weight in config.RISK_WEIGHTS.items():
        value = float(props.get(_FACTOR_KEYS[factor], 0.0))
        contributions[factor] = round(weight * max(0.0, min(1.0, value)) * 100.0, 1)
    return contributions

