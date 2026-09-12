#!/usr/bin/env python3
import glob
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
QDIR = ROOT / "public/data/qfiles"
ODIR = Path(__file__).resolve().parent

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).lower()
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"[^a-z0-9]+", "", s)

def trigrams(s: str):
    return {s[i:i+3] for i in range(max(0, len(s)-2))}

def score(a: str, b: str) -> float:
    aa, bb = trigrams(norm(a)), trigrams(norm(b))
    if not aa or not bb:
        return 0
    return len(aa & bb) / len(aa | bb)

for year in range(111, 116):
    ocr = (ODIR / f"ocr-{year}.txt").read_text(errors="replace")
    rows = []
    for p in sorted(QDIR.glob(f"q-pp-im-it-{year}-*.json"), key=lambda p: int(p.stem.rsplit('-',1)[1])):
        q = json.loads(p.read_text())
        text = q["text"]
        # Compare against fixed-size OCR windows to flag questions that have little textual support.
        words = ocr.split()
        qwords = text.split()
        width = max(25, min(len(qwords) + 25, 130))
        best = (0, "")
        step = max(1, width // 8)
        for i in range(0, len(words), step):
            window = " ".join(words[i:i+width])
            s = score(text, window)
            if s > best[0]:
                best = (s, window[:220])
        rows.append({"id": q["id"], "text": text, "score": round(best[0], 3), "ocr_window": best[1]})
    (ODIR / f"comparison-{year}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    print(year, len(rows), "low", [(r['id'], r['score']) for r in rows if r['score'] < .18])
