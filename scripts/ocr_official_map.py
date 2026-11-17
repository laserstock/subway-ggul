"""Render the official map at higher scale and OCR Korean/English labels."""

from __future__ import annotations

import json
from pathlib import Path

import easyocr
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "assets" / "map_korea.pdf"
HI = ROOT / "assets" / "map_korea_ocr_hi.png"
OUT = ROOT / "assets" / "map_ocr_hi.json"
SCALE = 1.6


def main() -> None:
    doc = pymupdf.open(PDF)
    page = doc[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), alpha=False)
    pix.save(HI)
    print("rendered", HI, pix.width, pix.height)

    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)
    results = reader.readtext(str(HI), detail=1, paragraph=False)
    out = []
    for bbox, text, conf in results:
        text = text.strip()
        if conf < 0.3 or not text:
            continue
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        out.append(
            {
                "text": text,
                "x": round((sum(xs) / 4) / SCALE, 1),
                "y": round((sum(ys) / 4) / SCALE, 1),
                "conf": round(float(conf), 3),
            }
        )
    OUT.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("wrote", OUT, "labels", len(out))


if __name__ == "__main__":
    main()
