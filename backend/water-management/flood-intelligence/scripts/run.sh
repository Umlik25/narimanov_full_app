#!/usr/bin/env bash
# Boot the AquaWatch service + demo viewer.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  ./.venv/bin/python -m pip install -q --upgrade pip
  ./.venv/bin/python -m pip install -q -r requirements.txt
fi

# Ensure processed layers exist.
if [ ! -f "data/processed/hotspots.geojson" ]; then
  ./.venv/bin/python data/pipeline/generate.py
fi

echo "AquaWatch -> http://localhost:8000/viewer/   (API docs: /docs)"
exec ./.venv/bin/python -m uvicorn service.main:app --reload --port 8000
