# Final flashcard UI / SRS re-review

## Verdict

The five previously identified UI/SRS blockers are now resolved in the implementation:

- unseen cards use one fixed timestamp and deterministic input-order ties;
- initial server/client render uses the same empty schedule, then loads local state after mount;
- rows, queue, header count, and subject coverage share one in-memory schedule snapshot;
- legacy/imported saved words are sanitized, canonicalized, deduplicated, and have SRS IDs migrated;
- tier controls are scoped dynamically and filtered empty states are no longer reported as an
  empty subject.

The flashcard/SRS code is acceptable at the requested 4,728–4,764 direct-card scale. There is
no remaining known correctness must-fix. One performance release gate remains: the client
route still imports the full roughly 3.57 MB raw flashcard JSON. Production payload/mobile
measurements are still required; split or lazy-load the data if the full dataset is shipped in
route JS or causes visible latency.

No product files were changed during this re-review.

## Verification

Commands run against the current shared worktree:

- `pnpm test -- --runInBand src/__tests__/flashcard-store.test.ts src/__tests__/saved-words.test.ts src/__tests__/srs.test.ts`
  - Pass: 3 suites, 26 tests.
- `pnpm typecheck`
  - Pass after adding the test module boundary and null guard.

## Resolved blocker review

### Fixed-time due selectors and stable ordering — resolved

`initialCardState(cardId, now)` now accepts the caller's timestamp. The pure
`dueCardsFromState(cards, states, now)` and `dueCountFromState(...)` selectors use that same
timestamp for every missing state. Queue sorting uses `nextReview` then original input index,
so unseen cards remain deterministic.

The new regression test creates 4,728 unseen cards, makes `Date.now()` advance, passes a fixed
`now`, and verifies:

- all 4,728 are due;
- the first 50 retain input order;
- due count is 4,728;
- the selector does not call `Date.now()` internally.

Conclusion: acceptable.

### Hydration-safe schedule — resolved

The page initializes `schedule` as `{ states: {}, now: 0 }`. That value is deterministic on
both server pre-render and first client hydration. Real localStorage is read only inside
`useEffect`, after which the schedule and saved-word React state are updated.

All initial unseen cards resolve against timestamp zero and render consistently as due.
Stored future schedules appear only after mount, avoiding the prior server/client markup
disagreement.

Conclusion: implementation is acceptable. A dedicated hydration regression test would still
be useful, but its absence is not a release blocker given the now-explicit state boundary.

### Single schedule snapshot — resolved

The page no longer calls storage-backed `getCardState`, `getDueCards`, or `getDueCount` while
rendering. It loads one schedule, then uses pure selectors for:

- filtered due queue;
- global due badge;
- subject coverage counts;
- visible row due dates.

Rating returns the persisted `CardSRSState` and updates the in-memory schedule immediately,
so the next browse render is consistent without another per-row localStorage read.

Conclusion: the prior dozens-of-JSON-parses-per-render issue is resolved.

Minor acceptable limitation: `schedule.now` advances on mount and rating, but not on a timer.
A page left open until a future card becomes due will not update automatically until another
state change/reload. Since intervals are measured in days, this is not a release blocker; a
visibility-change refresh can be added later.

### Legacy saved-word sanitation and SRS migration — resolved

`sanitizeState` now protects `savedWords` and `srsState` from null/non-collection values.
`normalizeSavedWords` canonicalizes case and curly quotes, deduplicates by normalized term,
recomputes the canonical lexicon ID, and moves an old SRS record to that ID. Both normal load
and import pass through this path.

Tests cover:

- new-write case/curly-quote deduplication;
- two legacy aliases with an old card ID;
- migration of the old schedule to `lx-authors`;
- null saved-word/SRS imports;
- orphan pruning on sanitized state.

Conclusion: resolved for the reported legacy/null cases.

Non-blocking hardening: individual SRS objects are currently checked only as records, not
field-by-field for finite numeric values. A manually corrupted object could still yield
`NaN` dates. Schema-level validation can be added separately.

### Dynamic tier controls and empty states — resolved

Available tiers are derived from the current subject-scoped cards. Tier buttons are hidden
when the scope has no tiered cards, and a stale tier is reset to `all`. Filtering is bypassed
when tiers are unavailable, so switching from English vocabulary to CS, another IM subject,
or saved words does not leave an invisible tier constraint.

When cards exist but search/tier filters match none, the page now says that no cards match and
offers `清除篩選`; the true empty-subject and empty-saved-word messages remain separate.

Conclusion: acceptable.

Non-blocking edge case: a manually supplied cross-exam query such as
`/cs/flashcards?subject=im-english` still looks like an empty subject rather than canonicalizing
back to `all`. This does not affect normal button navigation but is worth sanitizing later.

## 50-card review and browse performance

The review queue remains capped with `dueCards.slice(0, 50)` and shows `batch / total` in the
CTA. The fixed selector preserves overdue-first order and deterministic unseen order. This is
acceptable.

Browse rendering remains capped at 60 rows with explicit incremental loading. Search/filter
changes reset the visible limit and expanded row. This resolves the DOM explosion.

However, the page is still a client component importing `flashcards` through `content.ts`.
The current `flashcards.json` observed during re-review is approximately 3,572,113 bytes raw.
The browse cap does not reduce transfer, JavaScript/RSC parsing, construction of thousands of
`ReviewCard` objects, or full-answer substring scanning.

Before performance sign-off, record on a production build:

- compressed route JS/RSC transfer attributable to flashcards;
- script/data parse and hydration time;
- input latency while searching answers;
- time from CTA click to the first review card;
- results on a mid-range mobile profile.

If the full dataset is embedded in route JS or causes visible latency, partition by exam/tier
or move search/pagination behind a lazy data boundary. The installed Next 15.5.19 package
still lacks the instructed local `node_modules/next/dist/docs/`, so read/restore matching docs
before choosing the exact Next server/client implementation.

## Remaining classification

- **Must fix now:** none known; targeted tests and typecheck pass.
- **Must measure before release:** full client data payload and mobile search/start-review
  latency; fix the data boundary if measurements are not acceptable.
- **No remaining correctness blocker in the five re-reviewed flashcard/SRS paths.**
- **Should add later:** hydration UI regression test, invalid query canonicalization,
  field-level SRS schema validation, and visibility/timer refresh for newly due cards.
