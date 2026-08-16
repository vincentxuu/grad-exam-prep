# Stacked branch conflict resolution

## Goal

Stack the resolved `agent/nonenglish-flashcards` branch underneath `agent/multi-subject-learning`, preserving both the audited practice workflow and IM-IT 61/61 learning coverage.

## Checks

- [x] Merge the resolved PR #13 branch and record the eight conflicted shared-learning paths.
- [x] Preserve full lesson drill queues, evidence notes, foundation fallbacks, and open-ended guards.
- [x] Preserve all regression tests from both branches and add single-question queue navigation coverage.
- [x] Validate 35 lessons, 191 cards, and 61/61 subtopic coverage.
- [x] Run content validation, paper integrity, Jest (49 suites / 381 tests), typecheck, and production build (69 static pages, exit 0).
- [x] Push the stacked merge commit to `origin/agent/multi-subject-learning`.
