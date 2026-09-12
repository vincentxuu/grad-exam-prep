# Remaining IM English paper repair

## Scope

- [x] Audit pp-im-en-109 against its bundled source PDF
- [x] Audit pp-im-en-111 against its bundled source PDF
- [x] Audit pp-im-en-112 against its bundled source PDF
- [x] Resolve the pp-im-en-109 / pp-im-en-112 cross-paper duplication
- [x] Restore pp-im-en-111 shortened passage excerpts
- [x] Correct answers and explanations contradicted by source context
- [x] Remove content warnings only after page-level validation
- [x] Add a deterministic repair script and regression tests
- [x] Run content validation, integrity checks, tests, and typecheck

## Progress

- 2026-08-16: Started page-level audit of all three remaining flagged IM English papers.
- 2026-08-16: Confirmed 109 and 112 no longer share duplicated questions; both warnings were stale.
- 2026-08-16: Corrected 109 Q16/Q30, rebuilt all 111/112 answer records, and restored two shortened 111 excerpts.
- 2026-08-16: Removed all three stale paper flags and added 50-key/no-duplicate/passage regression coverage.
- 2026-08-16: Focused Jest 14/14, content validation, integrity check, and TypeScript check passed.
