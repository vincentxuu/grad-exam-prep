# PR #13 conflict resolution

## Goal

Merge `origin/main` into `agent/nonenglish-flashcards` without dropping either the audited non-English practice work or the reviewed IM-IT learning content now on `main`.

## Checks

- [x] Record the exact conflicted paths: 12 total (6 structured data, 6 UI/catalog/test).
- [x] Resolve structured data by stable IDs and preserve both branches' reviewed corrections.
- [x] Resolve shared learning and question UI around the newest reusable architecture.
- [x] Keep package/config additions from both branches.
- [x] Run content validation, paper integrity, Jest (47 suites / 370 tests), typecheck, and production build (54 static pages).
- [x] Push the merge commit to `origin/agent/nonenglish-flashcards` and confirm PR #13 is no longer conflicting.
