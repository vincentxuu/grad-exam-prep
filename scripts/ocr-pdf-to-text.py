#!/usr/bin/env python3
"""Extract text from scanned PDF using RapidOCR, save to text file."""
import sys
import fitz  # PyMuPDF
from rapidocr import RapidOCR

def extract(pdf_path, output_path):
    engine = RapidOCR()
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=250)
        img_path = f"/tmp/_ocr_page_{i}.png"
        pix.save(img_path)
        result = engine(img_path)
        if result and result.txts:
            text = "\n".join(result.txts)
            pages.append(f"=== PAGE {i+1} ===\n{text}")
            print(f"Page {i+1}: {len(result.txts)} lines", file=sys.stderr)
        else:
            pages.append(f"=== PAGE {i+1} ===\n(empty)")
            print(f"Page {i+1}: empty", file=sys.stderr)

    with open(output_path, "w") as f:
        f.write("\n\n".join(pages))
    print(f"Saved to {output_path}", file=sys.stderr)

if __name__ == "__main__":
    pdf = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else pdf.replace(".pdf", ".txt")
    extract(pdf, out)
