#!/usr/bin/env bash
set -euo pipefail

output_root="tmp/pdfs/im-it-audit"
mkdir -p "$output_root"

for year in $(seq 106 115); do
  paper="public/papers/pp-im-it-${year}.pdf"
  paper_dir="$output_root/$year"
  mkdir -p "$paper_dir"

  if ! compgen -G "$paper_dir/page-*.png" >/dev/null; then
    pdftoppm -png -r 180 "$paper" "$paper_dir/page" >/dev/null 2>&1
  fi

  for image in "$paper_dir"/page-*.png; do
    text_path="${image%.png}.txt"
    if [[ ! -s "$text_path" ]]; then
      tesseract "$image" stdout -l eng+chi_tra --psm 6 2>/dev/null > "$text_path"
    fi
  done
done
