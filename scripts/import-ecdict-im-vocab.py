#!/usr/bin/env python3
"""Extract the required IM vocabulary from a pinned ECDICT CSV checkout."""

import argparse
import csv
import json
from pathlib import Path

from opencc import OpenCC


ROOT = Path(__file__).resolve().parent.parent
MASTER_PATH = ROOT / "public/data/ntu-im-vocab-master.json"
OUTPUT_PATH = ROOT / "public/data/im-vocab-lexicon.json"
REQUIRED_TIERS = {"must_know", "important", "worth_studying", "domain"}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ecdict", required=True, type=Path, help="Path to ECDICT ecdict.csv")
    parser.add_argument("--revision", required=True, help="Pinned ECDICT git revision")
    return parser.parse_args()


def normalize(value):
    return value.lower().replace("‘", "'").replace("’", "'").strip()


def main():
    args = parse_args()
    master = json.loads(MASTER_PATH.read_text())
    required = [word for word in master["words"] if word["tier"] in REQUIRED_TIERS]
    required_by_key = {normalize(word["word"]): word for word in required}
    matches = {}

    with args.ecdict.open(newline="", encoding="utf-8") as stream:
        for row in csv.DictReader(stream):
            key = normalize(row["word"])
            if key in required_by_key and key not in matches:
                matches[key] = row

    converter = OpenCC("s2twp")
    entries = []
    for item in required:
        row = matches.get(normalize(item["word"]))
        entries.append(
            {
                "word": item["word"],
                "phonetic": row["phonetic"].strip() if row else "",
                "definition": row["definition"].strip() if row else "",
                "translation": converter.convert(row["translation"].strip()) if row else "",
                "pos": row["pos"].strip() if row else "",
                "tags": row["tag"].split() if row and row["tag"].strip() else [],
            }
        )

    payload = {
        "metadata": {
            "source": "skywind3000/ECDICT",
            "sourceRevision": args.revision,
            "license": "MIT",
            "requiredTiers": sorted(REQUIRED_TIERS),
            "requiredWords": len(required),
            "matchedWords": sum(1 for entry in entries if entry["translation"] or entry["definition"]),
        },
        "entries": entries,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

    print(
        json.dumps(
            {
                "output": str(OUTPUT_PATH.relative_to(ROOT)),
                "required": len(required),
                "matched": payload["metadata"]["matchedWords"],
                "missing": len(required) - payload["metadata"]["matchedWords"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
