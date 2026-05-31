"""Flood-risk scoring for micro-catchments.

Risk is a transparent weighted blend of normalized factors (CLAUDE.md §4). All
factors arrive already normalized to 0..1 on each catchment's properties, so the
score is reproducible and easy to defend in Q&A.
"""
from __future__ import annotations

from typing import Dict

from . import config


# Catchment property keys that carry each normalized (0..1) factor.
_FACTOR_KEYS = {
    "imperviousness": "imperviousness",
    "sink": "sink_index",
    "upstream_area": "upstream_norm",
    "low_slope": "low_slope_index",
}


def risk_score(props: Dict[str, float]) -> float:
    """Compute a 0..100 flood-risk score from a catchment's properties."""
    score = 0.0
    for factor, weight in config.RISK_WEIGHTS.items():
        value = float(props.get(_FACTOR_KEYS[factor], 0.0))
        score += weight * max(0.0, min(1.0, value))
    return round(score * 100.0, 1)


def explain(props: Dict[str, float]) -> Dict[str, float]:
    """Per-factor point contributions, so a UI can show *why* a cell is risky."""
    contributions: Dict[str, float] = {}
    for factor, weight in config.RISK_WEIGHTS.items():
        value = float(props.get(_FACTOR_KEYS[factor], 0.0))
        contributions[factor] = round(weight * max(0.0, min(1.0, value)) * 100.0, 1)
    return contributions
