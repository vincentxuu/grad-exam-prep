#!/usr/bin/env python3
"""Download exam PDFs and extract only pages needed for hasImage questions."""

import json
import math
import os
import sys
from collections import defaultdict
from io import BytesIO
from pathlib import Path

try:
    import fitz
    from PIL import Image
except ImportError:
    print("Need: pip install PyMuPDF Pillow")
    sys.exit(1)

import urllib.request

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data"
OUT = ROOT / "public" / "images" / "papers"

MAX_WIDTH = 1000
JPEG_QUALITY = 65


def main():
    with open(DATA / "questions.json") as f:
        questions = json.load(f)["questions"]
    with open(DATA / "past-papers.json") as f:
        papers = json.load(f)["papers"]

    paper_url = {p["id"]: p["url"] for p in papers}

    img_qs = [q for q in questions if q.get("hasImage")]
    paper_ids = sorted(set(q["paperId"] for q in img_qs))

    # Build per-paper info: which question numbers need images
    paper_info = {}
    for pid in paper_ids:
        all_in_paper = [q for q in questions if q["paperId"] == pid]
        max_q = max(q["number"] for q in all_in_paper)
        img_nums = [q["number"] for q in all_in_paper if q.get("hasImage")]
        paper_info[pid] = {"max_q": max_q, "img_nums": img_nums}

    print(f"Processing {len(paper_ids)} papers with {len(img_qs)} image questions")

    # Dedup PDFs (some papers share the same URL)
    url_to_papers = defaultdict(list)
    for pid in paper_ids:
        url = paper_url.get(pid)
        if url:
            url_to_papers[url].append(pid)

    # question_id -> list of page image paths
    question_images = {}

    for url, pids in url_to_papers.items():
        primary_pid = pids[0]

        # Download PDF
        pdf_path = f"/tmp/exam-pdfs/{primary_pid}.pdf"
        os.makedirs("/tmp/exam-pdfs", exist_ok=True)

        if not os.path.exists(pdf_path):
            print(f"  Downloading {primary_pid} from {url}")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    with open(pdf_path, "wb") as f:
                        f.write(resp.read())
            except Exception as e:
                print(f"  ERROR downloading {primary_pid}: {e}")
                continue
        else:
            print(f"  Using cached {primary_pid}")

        try:
            doc = fitz.open(pdf_path)
        except Exception as e:
            print(f"  ERROR opening {primary_pid}: {e}")
            continue

        num_pages = doc.page_count

        # Figure out which pages to extract for ALL papers sharing this PDF
        needed_pages = set()
        page_assignments = {}  # (pid, qnum) -> set of pages

        for pid in pids:
            info = paper_info[pid]
            for qnum in info["img_nums"]:
                est_page = math.ceil(qnum * num_pages / info["max_q"]) if info["max_q"] > 0 else 1
                est_page = min(est_page, num_pages)
                needed_pages.add(est_page)
                page_assignments[(pid, qnum)] = {est_page}

        # Extract needed pages
        out_dir = OUT / primary_pid
        out_dir.mkdir(parents=True, exist_ok=True)

        page_paths = {}  # page_num -> relative path
        for page_num in sorted(needed_pages):
            page = doc[page_num - 1]
            out_file = out_dir / f"page-{page_num}.jpg"

            # Always use get_pixmap which respects page rotation
            scale = MAX_WIDTH / page.rect.width
            mat = fitz.Matrix(scale, scale)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            img.save(str(out_file), "JPEG", quality=JPEG_QUALITY, optimize=True)
            rel_path = f"/images/papers/{primary_pid}/page-{page_num}.jpg"
            page_paths[page_num] = rel_path
            size_kb = out_file.stat().st_size / 1024
            print(f"    Page {page_num}: {img.width}x{img.height} -> {size_kb:.0f}KB")

        doc.close()

        # Assign pages to questions
        for (pid, qnum), pages in page_assignments.items():
            qid = f"q-{pid}-{qnum}"
            # Find the actual question ID
            matching = [q for q in questions if q["paperId"] == pid and q["number"] == qnum and q.get("hasImage")]
            for q in matching:
                question_images[q["id"]] = sorted([page_paths[p] for p in pages if p in page_paths])

    # Save the mapping
    mapping_file = DATA / "question-images.json"
    with open(mapping_file, "w") as f:
        json.dump(question_images, f, indent=2, ensure_ascii=False)
    print(f"\nSaved mapping to {mapping_file}")
    print(f"Questions mapped: {len(question_images)}")

    # Print summary
    total_size = sum(
        f.stat().st_size
        for d in OUT.iterdir()
        if d.is_dir() and not d.is_symlink()
        for f in d.glob("*.jpg")
    )
    total_files = sum(
        1
        for d in OUT.iterdir()
        if d.is_dir() and not d.is_symlink()
        for f in d.glob("*.jpg")
    )
    print(f"Total: {total_files} page images, {total_size / 1024 / 1024:.1f}MB")


if __name__ == "__main__":
    main()
