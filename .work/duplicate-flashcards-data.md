# IM English flashcard duplicate diagnosis (data/pipeline)

## Conclusion

This is a **bulk-generated repeated-template data problem**, not a duplicate React render and not an accidental merge of the two auxiliary vocab-card JSON files.

- Runtime imports only `public/data/flashcards.json` (`src/lib/content.ts:12-25`) and filters it by subject without deduplication (`src/lib/content.ts:71-73`). The browse list maps the filtered array in source order (`src/app/[exam]/flashcards/page.tsx:73-77,269-301`).
- `im-english` has 5,452 runtime cards. All 5,452 IDs, full prompts, and `(prompt, answer)` pairs are unique: **0 exact duplicate rows**.
- However, only 2,330 normalized stems exist. 3,144 rows belong to a repeated-stem group; using the literal first paragraph as the stem, 3,130/5,452 rows (57.41%) belong to 15 repeated templates.
- The screenshot's exact stem, `The professor emphasized the importance of _____ in the research methodology.`, occurs **2,833 times** (51.96% of the entire subject). Each has different options, so exact-prompt dedupe reports zero and misses the defect.
- Of those 2,833 cards, 2,391 are labelled `im-english-domain` and 442 are labelled `im-english-reading`, even though they are all synthetic vocabulary cloze prompts.
- A contiguous block of **2,822** such cards occupies zero-based `flashcards.json` array indices 3,110-5,931 (the end of the file). Since browse mode preserves file order, scrolling into this block produces the wall of apparently identical cards in the screenshot.

## Quantified data evidence

| Metric | Count |
|---|---:|
| all runtime flashcards | 5,932 |
| runtime `im-english` cards | 5,452 |
| unique `im-english` IDs | 5,452 |
| unique full prompts | 5,452 |
| unique `(prompt, answer)` pairs | 5,452 |
| normalized unique stems | 2,330 |
| rows in repeated normalized-stem groups | 3,144 |
| screenshot stem | 2,833 |
| largest contiguous screenshot-stem run | 2,822 |

Next most repeated generated stems include:

- `The report described the situation as _____ and requiring immediate attention.` — 40
- `Experts noted that the _____ of the new approach could significantly impact outcomes.` — 38
- `The committee decided to _____ the existing regulations to address new challenges.` — 30
- `The _____ between the two proposals was immediately apparent to observers.` — 28
- `The organization aims to _____ its operations to improve overall efficiency.` — 26
- `The professor emphasized the importance of maintaining _____ standards.` — 26

Representative runtime locations: the first screenshot-template card is `fc-im-vocab-autonomous` at `public/data/flashcards.json:15771`; screenshot-visible examples include `fc-im-vocab-outsourcing` at line 23891 and `fc-im-vocab-precipitous` at line 28563; the template continues through `fc-im-vocab-verification` at line 48011.

## Source/merge analysis

- `public/data/vocab-flashcards.json`: 267 rows; all 267 are present in runtime `flashcards.json` by exact `(prompt, answer)` match.
- `public/data/vocab-flashcards-expanded.json`: 782 rows; all 782 are present in runtime `flashcards.json` by exact `(prompt, answer)` match.
- The two auxiliary files have zero exact-ID overlap with one another.
- Crucially, **none** of the 2,833 screenshot-template rows come from either auxiliary file. They form another bulk-generated batch embedded directly in `flashcards.json`.
- Therefore, changing which auxiliary JSON is imported would not fix the screenshot; neither auxiliary file is imported by runtime code anyway.

## Provenance and root cause

Git commit `8152288` (`feat(vocab): 建立台大資管所英文備考字庫系統`, 2026-08-16) expanded runtime flashcards from 560 to 5,932 and `im-english` from 80 to 5,452. The parent revision had **zero** cards with the screenshot stem; this commit introduced all 2,833 (52.74% of its 5,372 newly added cards).

No reproducible flashcard-generation script was added in that commit or exists under the current `scripts/` tree. The commit directly adds the generated JSON artifacts. Thus the exact generator implementation is unavailable in-repo, but the artifact pattern establishes that it used a tiny generic sentence-template pool and changed choices/answers per vocabulary item.

The existing validator cannot detect this failure mode. `scripts/validate-content.js:121-133` checks duplicate IDs, valid exam/subject IDs, and topic existence only. It does **not** check duplicate normalized stems, template concentration, grammatical compatibility, or semantic plausibility. Because each generated row has a unique ID and option list, it passes validation.

## Root-cause statement

The immediate root cause is that commit `8152288` bulk-appended thousands of synthetic vocab cards generated from a very small template pool; one fallback template alone was reused 2,833 times. Source-order rendering exposes a 2,822-card contiguous run. Unique options make the full strings technically unique, while validation only guards duplicate IDs, so the data-quality defect was neither deduplicated nor rejected.

Reproduce stats with `.work/analyze-flashcard-duplicates.mjs`.
