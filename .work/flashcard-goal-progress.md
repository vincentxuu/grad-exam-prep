# Flashcard goal progress

Last updated: 2026-08-16

## Goal

- Vocabulary/phrase on the front; complete explanation on the back; shared SRS.
- Multiple-choice questions only in the question bank.
- Curated necessary master vocabulary covered exactly once.
- Deterministic generation and regression checks.
- Full tests, build, and actual page verification before completion.

## Completed

- Replaced repeated synthetic IM English cloze questions with deterministic direct-recall cards.
- Added pinned ECDICT import and third-party notice.
- Independently reviewed the 118 entries unmatched by both master Chinese and ECDICT.
- Three independent curation passes reviewed 243 edge cases. Current contract: 4,859 raw target-tier entries, 131 documented aliases/non-vocabulary exclusions, 4,728 generated cards, zero missing Chinese meanings and zero substantively incomplete backs.
- Added stable IDs, `kind`, `headword`, `tier`, provenance, and 1,774 authentic source examples.
- Added search, tier filters, 60-card incremental browsing, and 50-card SRS sessions.
- Normalized saved-word case/curly apostrophes and preserved SRS state when the canonical ID changes.
- Added deterministic stale-artifact check and exact curated-coverage/content-shape validation.
- Resolved fixed-time due ordering, hydration-safe one-snapshot SRS reads, legacy/import deduplication, orphan cleanup, and tier-scope empty states.
- Removed the 3.57 MB flashcard JSON from the client bundle; production build reduced `/[exam]/flashcards` First Load JS from 1.28 MB to 161 kB and loads card data through `/api/flashcards` after hydration.
- Production page verified with `stealth_fetch` at `/im/flashcards?subject=im-english`: 4,728 English cards, direct word fronts, search/tier controls, 50-card review batch, 60 visible rows, and 4,668 remaining behind incremental load.

## Final verification

- Jest: 22 suites / 256 tests passed.
- TypeScript: passed.
- Deterministic generator stale check: passed.
- Content validation and independent three-review audit: passed.
- Production Next build: passed.
- Task-scoped Biome check and `git diff --check`: passed.
- Full-repository Biome still reports unrelated pre-existing parse/format errors in legacy scripts; task-scoped files are clean.

## Completion gate

- All goal gates passed. The page is now a direct-recall flashcard experience; multiple-choice content remains in the question bank.
