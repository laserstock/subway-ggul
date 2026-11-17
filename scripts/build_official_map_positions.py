"""Match OCR labels on the official Seoul Metro PDF to GUIDE_STATIONS map coordinates."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OCR_PATH = ROOT / "assets" / "map_ocr_hi.json"
FALLBACK_OCR = ROOT / "assets" / "map_ocr.json"
STATIONS_PATH = ROOT / "assets" / "guide_stations_min.json"
OUT_PATH = ROOT / "app" / "_lib" / "officialMapPositions.json"
W = H = 2552


def norm_ko(text: str) -> str:
    t = re.sub(r"[^0-9A-Za-z가-힣]", "", text)
    if t.endswith("역"):
        t = t[:-1]
    return t


def norm_en(text: str) -> str:
    t = re.sub(r"[^A-Za-z0-9]", "", text).lower()
    for suffix in ("station", "sta", "univ", "university"):
        if t.endswith(suffix) and len(t) > len(suffix) + 2:
            t = t[: -len(suffix)]
    return t


def load_ocr() -> list[dict]:
    path = OCR_PATH if OCR_PATH.exists() else FALLBACK_OCR
    raw = json.loads(path.read_text(encoding="utf-8"))
    cleaned = []
    for row in raw:
        ko = norm_ko(row["text"])
        en = norm_en(row["text"])
        if not ko and not en:
            continue
        if ko in {"서울특별시", "서울교통공사", "서울지하철노선도", "노선도", "미개통", "급행", "일반"}:
            continue
        if len(ko) > 14:
            continue
        cleaned.append({**row, "ko": ko, "en": en})
    return cleaned


def geo_xy(lat: float, lng: float) -> tuple[float, float]:
    """Rough geographic projection into map space for disambiguation only."""
    x = (lng - 126.55) / 0.85 * W
    y = (37.85 - lat) / 0.65 * H
    return x, y


def main() -> None:
    ocr = load_ocr()
    stations = json.loads(STATIONS_PATH.read_text(encoding="utf-8"))

    by_ko: dict[str, list[dict]] = defaultdict(list)
    by_en: dict[str, list[dict]] = defaultdict(list)
    for row in ocr:
        if row["ko"]:
            by_ko[row["ko"]].append(row)
        if row["en"] and len(row["en"]) >= 3:
            by_en[row["en"]].append(row)

    matched: dict[str, dict] = {}

    def pick(cands: list[dict], station: dict) -> dict | None:
        if not cands:
            return None
        if len(cands) == 1:
            return cands[0]
        gx, gy = geo_xy(station["lat"], station["lng"])
        return min(cands, key=lambda r: (r["x"] - gx) ** 2 + (r["y"] - gy) ** 2)

    for station in stations:
        base = norm_ko(station["ko"])
        cands = by_ko.get(base, [])
        # Prefer exact short labels over longer compound OCR (강남구청 vs 강남)
        exact = [c for c in cands if c["ko"] == base]
        chosen = pick(exact or cands, station)
        if not chosen:
            en = norm_en(station["en"])
            chosen = pick(by_en.get(en, []), station)
        if not chosen:
            continue
        matched[station["slug"]] = {
            "x": chosen["x"],
            "y": chosen["y"],
            "label": chosen["text"],
            "conf": chosen["conf"],
        }

    print(f"ocr matches {len(matched)} / {len(stations)}")

    # Affine fallback from matched points
    pts = []
    for station in stations:
        hit = matched.get(station["slug"])
        if not hit:
            continue
        pts.append((station["lng"], station["lat"], hit["x"], hit["y"]))
    pts_arr = np.array(pts)
    X = np.c_[pts_arr[:, 0], pts_arr[:, 1], np.ones(len(pts_arr))]
    Ax, *_ = np.linalg.lstsq(X, pts_arr[:, 2], rcond=None)
    Ay, *_ = np.linalg.lstsq(X, pts_arr[:, 3], rcond=None)
    print("affine mean abs err", float(np.mean(np.abs(X @ Ax - pts_arr[:, 2]))), float(np.mean(np.abs(X @ Ay - pts_arr[:, 3]))))

    for station in stations:
        if station["slug"] in matched:
            continue
        x = float(np.dot([station["lng"], station["lat"], 1], Ax))
        y = float(np.dot([station["lng"], station["lat"], 1], Ay))
        matched[station["slug"]] = {
            "x": round(min(max(x, 48), W - 48), 1),
            "y": round(min(max(y, 48), H - 48), 1),
            "label": None,
            "conf": 0,
            "fallback": True,
        }

    # Central Seoul focus (around City Hall / Jongno / Gangnam corridor)
    focus = {"x": 780, "y": 620, "w": 1180, "h": 1180}
    payload = {
        "width": W,
        "height": H,
        "image": "/maps/seoul-metro.png",
        "focus": focus,
        "stations": {
            slug: {
                "x": round(v["x"], 1),
                "y": round(v["y"], 1),
                "ocr": v.get("label"),
                "fallback": bool(v.get("fallback")),
            }
            for slug, v in matched.items()
        },
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print("wrote", OUT_PATH, "stations", len(payload["stations"]))
    for slug in [
        "seoul-station",
        "myeongdong",
        "gangnam",
        "hongik-univ",
        "jamsil",
        "city-hall",
        "gyeongbokgung",
        "itaewon",
        "seongsu",
        "anguk",
    ]:
        print(slug, payload["stations"].get(slug))


if __name__ == "__main__":
    main()
