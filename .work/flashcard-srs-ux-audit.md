# Flashcard / SRS UX audit after content removal

## Outcome

Removing low-quality cards fixes the visible repetition, but the flashcard surface is not yet
complete for the retained/required corpus. The main correctness risks are required-word
coverage, unstable SRS identity, saved-word ID collisions, and topic metadata drift. The main
runtime risk is repeatedly parsing all localStorage plus rendering thousands of rows.

Current snapshot while this audit ran:

- `public/data/flashcards.json`: 2,816 cards / 1.61 MB raw JSON.
- IM page receives 2,496 static cards; CS receives 320.
- `ntu-im-vocab-master.json` has 336 required targets when `must_know` (17) and `important`
  (319) are combined.
- 2,718 of 2,816 cards currently reference a `topicId` not declared by their subject. For
  `im-english`, all 2,336 current cards use `im-english-*` IDs while the subject declares only
  `im-en-reading`, `im-en-grammar`, and `im-en-vocab`.

The installed Next version is 15.5.19, but this package does not contain the instructed
`node_modules/next/dist/docs/` tree; only the package README/license are present. No product
files were changed and no version-specific Next implementation is prescribed below. Before
implementing a server/client page split, obtain the matching 15.5.19 guide or restore the
package docs.

## P0 correctness work

### 1. Required vocabulary must remain complete and stable

Quarantining cards by content quality can delete the only card for a required word. The
quality validator currently knows nothing about the authoritative target set. Implement the
mandatory coverage contract documented in `.work/validator-design.md`:

- Authoritative source: `public/data/ntu-im-vocab-master.json`.
- Explicit target tiers: `must_know` + `important` (currently 336 unique words).
- Exactly one explicit card mapping per required canonical word.
- Deterministic stable IDs (`fc-im-vocab-<canonical-slug>`) or a committed, reasoned override.
- Coverage must not be inferred from `extractWord`, prompts, or surviving card count.
- Generation/pruning must be atomic: build candidate output, validate 100% coverage and
  quality, then replace `flashcards.json` only on success.

Why this affects SRS: `srsState` is keyed only by card ID. Re-numbering regenerated cards
silently moves or loses a learner's schedule even if the displayed word looks correct.

Required tests:

- 336/336 mapped; missing and duplicate words name their source words and card IDs.
- Reordering the source does not change IDs; two generations produce the same mapping.
- Existing SRS state for a required word still resolves after regeneration.
- Every mapped direct-memory card has a usable explicit target word for speech/rendering.

### 2. Saved words can produce duplicate React keys and shared SRS state

`addSavedWord` deduplicates by exact, case-sensitive `headword`, but `lexiconCardId` lowercases
and slugifies. Saving `Intercept` and `intercept` creates two rows with the same
`lx-intercept` ID. The flashcard page then has duplicate React keys, inflated counts, and two
rows sharing one SRS schedule. Removing one variant deletes that shared SRS state while the
other row remains. Apostrophe/punctuation slug collisions have the same class of failure.

Action:

- Define saved-word identity once. Prefer a validated canonical term plus a collision-safe,
  stable card ID.
- Deduplicate/add/remove by that identity, not raw headword spelling.
- On load/import, migrate duplicate saved words deterministically and preserve the newest
  useful fields (`note`, source context) without deleting a still-referenced SRS state.
- Validate imported `savedWords` and `srsState`; shallow-merging defaults allows
  `savedWords: null`, which later makes `.map` throw.

Required tests:

- `Intercept` + `intercept` yields one card and one stable SRS state.
- Curly/straight apostrophe variants follow the declared identity policy.
- Removing one alias does not orphan a remaining card or delete shared state prematurely.
- Malformed/legacy imports (`savedWords: null`, duplicate IDs, missing `cardId`) are sanitized.

### 3. Reconcile topic IDs before adding a topic filter

The page currently filters only by subject. A topic filter is necessary for a corpus this
large, but almost every card's topic reference is presently invalid under the subject schema.
Building filter buttons from `subject.topics` would hide most cards; deriving raw labels from
cards would preserve inconsistent IDs as a public contract.

Action:

- Decide whether flashcard categories are the same entity as subject curriculum topics.
- If yes, migrate cards to declared IDs or expand `subjects-*.json` with every intentional
  category and human label. Then make unknown flashcard topics a validation error, not a
  warning.
- If no, add a separate typed `flashcardCategory` catalog instead of overloading `topicId`.
- Only then add a query-backed topic filter scoped to the selected subject. Invalid/stale
  `subject` or `topic` query values should fall back to `all` (or be canonically removed), not
  display the misleading `此科目尚無閃卡` state.

Required tests:

- Every card references a declared subject/topic or category.
- Subject change resets an incompatible topic.
- A stale cross-exam query such as CS + `subject=im-english` recovers to `all`.
- Counts, browse list, and review queue all use the same subject/topic predicate.

## P1 runtime and review behavior

### 4. The page performs repeated full localStorage parses

`getSRSCard` calls `load()`, which parses the entire stored JSON. During one render the page
calls it for every row, every due-queue calculation, the global due count, and each subject
coverage count. At thousands of cards this becomes roughly O(cards x storage-parse-size), in
addition to repeated filtering.

Action:

- Read `localStorageImpl.getState().srsState` once per refresh into a snapshot.
- Extract pure `buildDueQueue(cards, srsState, now)` and `getDueCount(...)` helpers; pass the
  same `now` so all labels/counts agree within a render.
- Compute subject/topic buckets once rather than repeatedly filtering `allCards`.
- Refresh the snapshot after rating a card or after an explicit storage/sync event.

The current `srs.test.ts` due-order test manually sorts SRS state objects. It does not exercise
the actual Zustand store, storage fallback, or `ReviewCard` ordering, so it can pass while the
page path regresses.

Required tests:

- Test the real extracted queue helper with reviewed, overdue, future, and unseen cards.
- Equal `nextReview` values retain a documented deterministic tiebreaker (content order or
  stable ID).
- One fixed `now` is used; unseen cards do not receive slightly different synthetic times
  during one queue build.
- A storage spy confirms one state read, not one JSON parse per card.

### 5. Browsing and a review session are still unbounded

The browse page maps every filtered card to DOM (`filteredCards.map`). The default IM route
therefore renders roughly 2,500 rows. All unseen cards are immediately due, and `startReview`
copies the entire due set into one session. After required vocabulary is restored this can
grow again.

Action:

- Add topic filtering plus incremental browse pagination (for example 50 rows and an explicit
  “show more”). Prefer this simple behavior before introducing a virtualization dependency.
- Cap a review session to a documented batch size (for example 20–50), while showing total
  due and remaining counts separately.
- Keep ordering oldest-due first, then apply the stable tie-breaker. Do not randomly sample
  away overdue reviewed cards.
- Clarify badge semantics: the header currently shows due count for all cards while the CTA
  count uses the active filter, so they can disagree legitimately but confusingly.

Required tests:

- 2,500 synthetic cards initially render only the page size, with accurate total text.
- Review batch is capped but reports the uncapped remaining count.
- Changing subject/topic resets pagination and produces the matching queue.
- Completing the last batch card exits cleanly and the next batch excludes newly scheduled
  cards.

### 6. Removed static IDs leave orphan SRS entries

Deleted cards no longer appear because the page constructs queues from current content, but
their `srsState` records remain in localStorage, exports, and cloud snapshots. If an ID is
later reused, the new card silently inherits old progress.

Action:

- Add a storage migration/version. Build the valid set from **all exams'** current static
  card IDs plus saved-word IDs; never prune using only the currently viewed exam.
- Remove invalid SRS IDs during migration/import, or preserve them in a separately versioned
  archive if quarantined cards are expected to return.
- Run the same sanitization after cloud download so old snapshots cannot reintroduce orphans.
- Never reuse a retired static card ID for a different canonical word/content identity.

Required tests:

- Removed static ID is absent after migration/export.
- CS progress survives migration initiated from the IM page.
- Saved-word SRS state survives if its saved word remains.
- Cloud import cannot reintroduce retired IDs.
- A restored card with the same canonical target/stable ID intentionally regains its state;
  unrelated content cannot claim that ID.

## P2 extraction and merge polish

### 7. `extractWord` is a display heuristic, not a data key

Coverage tests currently assert only a loose percentage, and the extractor supports a few
prompt shapes. Generated required cards should carry an explicit canonical target word. Use
that for speech and identity, falling back to `extractWord` only for legacy cards.

Add tests for:

- Required multiword phrases and hyphenated/apostrophe forms.
- Curly/straight quote variants.
- Prompts containing multiple quoted English fragments (avoid joining unrelated quotations
  into `x versus y`).
- Every required direct card returns the expected speech text, preferably from explicit
  metadata rather than parsing prose.

The present `vocab.test.ts` assertion that at most 10% of vocabulary-topic cards may fail
extraction is too weak for mandatory target cards. Retain it only for legacy/choice cards and
require 100% for the explicit required-card family.

### 8. Define static-card versus saved-word duplicate UX

Static content IDs and lexicon IDs intentionally do not collide, but the same canonical word
can appear once as a required static card and again in “我的單字”, producing two schedules.
This may be intentional (curated exam card versus personal context), but the UI currently
does not explain it.

Choose and test one policy:

- Keep both, clearly label sources and preserve separate schedules; or
- Merge them by canonical word, retain personal source/note on the curated card, and define
  which SRS state wins.

Do not silently deduplicate at render time: that would hide data while leaving ambiguous SRS
state in storage.

## Suggested implementation sequence

1. Land required-word coverage + stable-ID validation before any further pruning.
2. Fix saved-word canonical identity and storage import sanitation.
3. Reconcile topic/category metadata and make invalid references fatal.
4. Extract pure filter/queue helpers and add actual store-path tests.
5. Add topic filter, browse pagination, and bounded review batches.
6. Add versioned orphan-SRS migration and cloud-import sanitation.
7. Strengthen explicit target-word rendering/extraction tests and decide duplicate-source UX.

This sequence protects learning coverage and existing progress first, then addresses the
large-list experience without coupling data repair to a large UI rewrite.
