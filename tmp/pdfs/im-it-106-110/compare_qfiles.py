#!/usr/bin/env python3
import json
import re
from pathlib import Path
from rapidfuzz.fuzz import partial_ratio

ROOT = Path(__file__).resolve().parents[3]
TMP = Path(__file__).parent

PAGE_MAP = {
    106: [(range(1, 6), [1]), (range(6, 21), [2]), (range(21, 27), [2, 3])],
    107: [(range(1, 8), [1]), (range(8, 21), [2]), (range(21, 27), [2, 3])],
    108: [(range(1, 13), [1]), (range(13, 21), [2]), (range(21, 23), [3])],
    109: [(range(1, 14), [1]), (range(14, 21), [2]), (range(21, 23), [2, 3])],
    110: [(range(1, 13), [1]), (range(13, 27), [2]), (range(26, 30), [2, 3, 4])],
}

def norm(s: str) -> str:
    s = s.lower().replace('—', ' ').replace('–', ' ')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def pages_for(year, number):
    pages = []
    for nums, p in PAGE_MAP[year]:
        if number in nums:
            pages.extend(p)
    return sorted(set(pages))

for year in range(106, 111):
    for f in sorted((ROOT / 'public/data/qfiles').glob(f'q-pp-im-it-{year}-*.json'), key=lambda x: int(x.stem.rsplit('-', 1)[1])):
        q = json.loads(f.read_text())
        n = int(q['id'].rsplit('-', 1)[1])
        pgs = pages_for(year, n)
        ocr = '\n'.join((TMP / f'{year}-{p}.txt').read_text(errors='ignore') for p in pgs)
        score = partial_ratio(norm(q['text']), norm(ocr))
        print(f'{score:5.1f}\t{year}\t{n}\tp{",".join(map(str, pgs))}\t{len(q["text"])}')
