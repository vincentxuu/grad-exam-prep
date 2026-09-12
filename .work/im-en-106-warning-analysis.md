# pp-im-en-106 warning analysis

## Scope

- [x] Trace how paper content warnings are derived and rendered
- [x] Inspect pp-im-en-106 questions 1-50 and status metadata
- [x] Compare questions 21-50 against the bundled source PDF
- [x] Determine whether the screenshot reflects missing content, stale metadata, or warning placement

## Progress

- 2026-08-16: Started from the production question-drill screenshot.
- 2026-08-16: Confirmed the warning is paper-level; Q1 itself is intact and answer B is reasonable.
- 2026-08-16: The passages were added in commit 4f0ca03, but contentStatus/contentIssue were not updated.
- 2026-08-16: Structural integrity now passes, while duplicated/corrupted OCR remains in Q21, Q27, Q33, Q41, and Q46.
- 2026-08-16: Existing answers Q41, Q46, Q47, and Q49 contradict the restored passages, so the paper is still unsafe for scoring.
- 2026-08-16: PDF audit confirmed Q41 D→B, Q46 A→C, Q47 D→A, and Q49 D→B, plus omissions/duplication/OCR artifacts across all five passage groups.
- 2026-08-16: Repaired passage parents Q21/Q27/Q33/Q41/Q46 and synchronized local qfile mirrors.
- 2026-08-16: Corrected Q41/Q46/Q47/Q49 answers; normalized malformed source option Q13 from "even" to "even though" and documented the source typo.
- 2026-08-16: Removed the stale incomplete status and replaced lossy legacy passage scripts with the deterministic repair entry point.
- 2026-08-16: Added regression tests; focused Jest 9/9, content validation, paper integrity, and TypeScript checks all passed.
- 2026-08-16: Confirmed repair script idempotence via identical output hashes on consecutive runs.
