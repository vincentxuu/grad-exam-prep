# MIS and statistics PDF audit plan

## Scope

- MIS: years 106-115, 10 local PDFs, 37 current question records.
- Statistics: years 114-115, 2 local PDFs, 5 current question records.
- Statistics 106-113: determine from authoritative exam metadata whether no separate statistics section existed or source PDFs are missing.

## Authority and method

1. Treat the NTU examination PDF as the source of truth.
2. Render every page to PNG and visually inspect question boundaries, tables, formulas, images, subquestions, and points.
3. Use extracted PDF text only as a search aid, not as final layout evidence.
4. Record every mismatch by stable question ID before editing shared JSON files.
5. Apply repairs centrally, then freeze PDF and ordered-question SHA-256 snapshots.

## Progress

- [x] Audit MIS 106-110.
- [x] Audit MIS 111-115.
- [x] Audit statistics 114-115.
- [x] Resolve statistics 106-113 source status: the subject was not part of the written exam before year 114.
- [x] Apply verified repairs: 32 question records, 34 essay answer markers/explanations, and one question-image mapping.
- [x] Add regression validators and audited PDF/question SHA-256 snapshots.
- [x] Run full verification: 27 suites / 276 tests, content validation, paper integrity, typecheck, and production build.

## Final result

- MIS: 37/37 questions visually audited across years 106-115.
- Statistics: 5/5 questions visually audited across years 114-115.
- Statistics years 106-113: confirmed not applicable; the written subject had not yet been introduced.
- Repaired substantive source errors: MIS 107 Q4, MIS 111 Q1, statistics 114 Q5, and statistics 115 Q3.
- Added subquestion metadata to 28 MIS and 4 statistics questions.
- Normalized all 42 open-ended answers to `N/A`; explanations remain present and substantive.
- Restored five statistics paper-page images and corrected the statistics 114 Q4 image mapping.
- Moved 37 stale local statistics qfiles to `tmp/stale-im-stat-qfiles/` for recoverable quarantine.
