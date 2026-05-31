"""Sample real elevation from the downloaded Terrarium DEM tiles.

Used by generate.py to give every catchment cell a true ground elevation, from
which slope, sinks and D8 flow accumulation are computed.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from PIL import Image  # noqa: E402

from service import config  # noqa: E402

_TERRAIN_DIR = config.RAW_DIR / "terrain"


class ElevationSampler:
    def __init__(self):
        index = json.loads((_TERRAIN_DIR / "terrain_index.json").read_text())
        self.zoom = index["zoom"]
        self.size = index["tile_size"]
        self._tiles = {}  # (x,y) -> loaded RGB pixel access
        for t in index["tiles"]:
            img = Image.open(_TERRAIN_DIR / f"{self.zoom}_{t['x']}_{t['y']}.png").convert("RGB")
            self._tiles[(t["x"], t["y"])] = img.load()

    def _tile_xy(self, lon: float, lat: float):
        n = 2 ** self.zoom
        x = (lon + 180.0) / 360.0 * n
        lat_rad = math.radians(lat)
        y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
        return x, y

    def elevation(self, lon: float, lat: float) -> float:
        """Decode elevation (metres) at a coordinate, bilinear-free nearest pixel."""
        x, y = self._tile_xy(lon, lat)
        tx, ty = int(math.floor(x)), int(math.floor(y))
        px = min(self.size - 1, max(0, int((x - tx) * self.size)))
        py = min(self.size - 1, max(0, int((y - ty) * self.size)))
        pix = self._tiles.get((tx, ty))
        if pix is None:
            return 0.0
        r, g, b = pix[px, py]
        return (r * 256 + g + b / 256.0) - 32768.0


if __name__ == "__main__":
    s = ElevationSampler()
    c = config.MAP_CENTER
    print(f"Elevation at district centre ({c['lat']},{c['lon']}): {s.elevation(c['lon'], c['lat']):.1f} m")
