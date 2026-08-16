# Paper integrity repair

## Scope

- [x] Resolve duplicate question between `pp-cs-math-111` and `pp-cs-math-112`
- [x] Resolve duplicate question between `pp-im-it-108` and `pp-im-it-109`
- [x] Restore missing article for `pp-cs-arch-113` question 4
- [x] Restore missing articles for `pp-im-en-112` questions 16, 21, 26, 49, 50
- [x] Remove repaired findings from `scripts/paper-integrity-baseline.json`
- [x] Run integrity and content validation

## Working rules

- Treat the bundled PDFs in `public/papers/` as source of truth.
- Preserve unrelated working-tree changes.
- Research agents write findings under `.work/`; the primary agent performs the consolidated data edit.

## Progress

- 2026-08-16: Started source-PDF comparison and question-record audit.
- 2026-08-16: PDF comparison showed both duplicate findings were prefix-fingerprint false positives.
- 2026-08-16: Added explicit range headers to the four existing IM English passages.
- 2026-08-16: Restored the missing CS architecture article and corrected source-verified OCR errors.
- 2026-08-16: Integrity check reports no remaining or newly introduced findings.
- 2026-08-16: Content validation passed; its pre-existing flashcard topic warnings remain unchanged.
- 2026-08-16: Repair script is idempotent; targeted Jest suite passed (6/6).
