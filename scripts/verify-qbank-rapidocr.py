#!/usr/bin/env python3
"""Stage 1: RapidOCR bulk scan — compare question bank against PDFs."""

import json
import os
import re
import glob
import time
import warnings
from collections import defaultdict
from pathlib import Path

import fitz  # PyMuPDF for PDF→image
from rapidocr import RapidOCR

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parent.parent
PAPERS_DIR = ROOT / "public" / "papers"
QFILES_DIR = ROOT / "public" / "data" / "qfiles"

engine = RapidOCR()


def pdf_to_text(pdf_path):
    doc = fitz.open(str(pdf_path))
    full_text = ""
    for page in doc:
        pix = page.get_pixmap(dpi=200)
        img_path = f"/tmp/_rapidocr_page.png"
        pix.save(img_path)
        result = engine(img_path)
        if result and result.txts:
            full_text += "\n".join(result.txts) + "\n"
    return full_text


def normalize(s):
    s = re.sub(r'\s+', ' ', s).strip().lower()
    for old, new in [('‘', "'"), ('’', "'"), ('“', '"'), ('”', '"'),
                     ('（', '('), ('）', ')'), ('≤', '<='), ('≥', '>=')]:
        s = s.replace(old, new)
    return s


def extract_phrases(text, n=4):
    words = normalize(text).split()
    if len(words) < n:
        return [normalize(text)] if words else []
    return [' '.join(words[i:i+n]) for i in range(0, min(len(words) - n + 1, 20))]


def match_score(q_text, pdf_text_norm):
    phrases = extract_phrases(q_text)
    if not phrases:
        return 0, 0
    hits = sum(1 for p in phrases if p in pdf_text_norm)
    return hits, len(phrases)


def main():
    # Group question files by paper
    q_by_paper = defaultdict(list)
    for qf in sorted(QFILES_DIR.glob("q-pp-*.json")):
        with open(qf) as f:
            q = json.load(f)
        paper_id = re.sub(r'-(\d+)$', '', q['id']).replace('q-', '')
        q_by_paper[paper_id].append(q)

    pdfs = sorted(PAPERS_DIR.glob("pp-*.pdf"))
    results = []
    total_start = time.time()

    for pdf_path in pdfs:
        pid = pdf_path.stem
        questions = q_by_paper.get(pid, [])
        if not questions:
            continue

        print(f"  {pid} ({len(questions)} questions)...", end=" ", flush=True)
        start = time.time()
        pdf_text = pdf_to_text(pdf_path)
        pdf_text_norm = normalize(pdf_text)
        elapsed = time.time() - start

        matched = 0
        unmatched = []
        for q in questions:
            hits, total = match_score(q['text'], pdf_text_norm)
            ratio = hits / total if total > 0 else 0
            if ratio >= 0.3:
                matched += 1
            else:
                unmatched.append({
                    'id': q['id'],
                    'ratio': f"{hits}/{total}",
                    'snippet': q['text'][:80]
                })

        rate = matched / len(questions) if questions else 0
        status = "OK" if rate >= 0.7 else "MISMATCH"
        print(f"{status} ({matched}/{len(questions)} = {rate:.0%}) [{elapsed:.1f}s]")

        results.append({
            'paper': pid,
            'status': status,
            'matched': matched,
            'total': len(questions),
            'rate': round(rate, 2),
            'time': round(elapsed, 1),
            'unmatched': unmatched
        })

    total_elapsed = time.time() - total_start

    # Summary
    ok = sum(1 for r in results if r['status'] == 'OK')
    bad = sum(1 for r in results if r['status'] == 'MISMATCH')

    print(f"\n{'='*60}")
    print(f"Stage 1 Complete: {ok} OK, {bad} MISMATCH ({total_elapsed:.0f}s total)")
    print(f"{'='*60}")

    if bad > 0:
        print(f"\nPapers needing Stage 2 verification:")
        for r in results:
            if r['status'] == 'MISMATCH':
                print(f"  {r['paper']}: {r['matched']}/{r['total']} ({r['rate']:.0%})")
                for u in r['unmatched'][:3]:
                    print(f"    - {u['id']} (match: {u['ratio']}): {u['snippet']}...")

    # Save report
    report_path = ROOT / "tmp_qbank_verify_report.json"
    with open(report_path, 'w') as f:
        json.dump({'ok': ok, 'mismatch': bad, 'results': results}, f, ensure_ascii=False, indent=2)
    print(f"\nReport saved to: {report_path}")


if __name__ == '__main__':
    print("Stage 1: RapidOCR bulk verification")
    print(f"{'='*60}")
    main()
