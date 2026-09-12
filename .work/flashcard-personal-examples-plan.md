# Flashcard personal examples implementation

Status: complete (2026-08-16)

## Goal

When a vocabulary flashcard answer is revealed, make missing examples recoverable and let the learner generate stable examples from their familiar work, interests, and study goals without replacing trusted dictionary content.

## Scope

- Reuse the existing lexicon entry and personal bridge API/cache.
- Show a learner-controlled personal-example action on static vocabulary cards.
- Load cached general examples without generating unexpectedly.
- Generate personal examples only after explicit user action.
- Keep personalized output stable via the existing persona hash cache.
- Add loading, empty-profile, error, quota, and retry states.
- Add focused component/API tests and preserve existing flashcard behavior.

## Checklist

- [x] Read the installed Next version guidance or document its absence and use the matching official guide.
- [x] Trace persona storage, lexicon API behavior, and flashcard answer rendering.
- [x] Define a shared review enrichment component and request boundary.
- [x] Implement the answer-side UI and wire persona into flashcard review/browse surfaces.
- [x] Add regression tests for cached entry and explicit personal generation.
- [x] Run focused tests, typecheck, formatting checks, and update this plan with results.

## Decisions

- Personal generation must be explicit; revealing thousands of cards must not spend quota automatically.
- A cache-only GET may enrich missing generic examples for free.
- The personal bridge is additive and visibly labeled; it never overwrites the static answer.
- If no persona exists, send the learner to the existing persona setup rather than generating generic "personal" text.

## Implementation

- Added `FlashcardExampleSupport` to both browse and review answer surfaces.
- A missing embedded example triggers cache-only `GET /api/lexicon`; 404 does not generate or spend quota.
- Personal generation requires the explicit `用我的情境幫我記` action and reuses the existing persona-hash D1 cache.
- Static answer content remains authoritative; cached general examples and `PersonalBridge` are additive.
- Persona is read once with the existing flashcard localStorage snapshot and passed down as a serializable prop.
- Added abort/reset handling so a slow request cannot leak content into the next review card.
- Added a device-local warning and manual cloud-sync link to the persona form.

## Next guidance

- Installed version: Next 15.5.19.
- `node_modules/next/dist/docs/` is absent from this installation.
- Used the matching official Next 15 Server/Client Components and Route Handlers guides. The interactive, localStorage-dependent enrichment remains a small Client Component; the existing App Router route handler contract is unchanged.

## Verification

- Focused Jest: 5 suites, 24 tests passed.
- TypeScript: `npm run typecheck` passed.
- Task-scoped Biome: passed.
- `git diff --check`: passed.
- Production Next build: passed; `/[exam]/flashcards` First Load JS is 166 kB.
- Local live route loaded successfully at `/im/flashcards?subject=im-english` via `stealth_fetch` with 4,736 cards and the existing 60-row browse boundary.
