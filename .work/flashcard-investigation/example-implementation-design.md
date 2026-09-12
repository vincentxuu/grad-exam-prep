# Static vocabulary flashcard example integration design

Status: design complete (2026-08-16); product code unchanged.

## Outcome

The minimum safe implementation is an additive answer-side enrichment component:

1. Keep the static card answer as the primary, trusted layer.
2. When a static vocabulary card has no local example, issue a cache-only `GET /api/lexicon?q=...` after the answer is revealed and show up to two cached generic examples.
3. Always make the personal layer learner-controlled. Only `POST /api/lexicon` after the learner clicks **用我的情境解釋**.
4. Render the returned `PersonalBridge` below the static/generic answer, visibly labeled as AI-generated; never replace or rewrite `card.answer`.
5. If the learner has no usable persona, do not POST. Link to the existing `/{exam}/lookup` persona setup instead.

This reuses the current D1 entry cache, persona-hash cache, quota gate, and renderers. It needs no schema or API contract change.

## Current authority and constraints

- The flashcard page already has the canonical headword on each static `ReviewCard`: `fromFlashcard()` copies `card.headword` (`src/lib/review-card.ts:27-36`). In the current IM English artifact all 4,736 structured vocabulary cards have `headword`, including all 2,951 cards missing a local example.
- Review mode renders static vocabulary answers through `VocabAnswer` at `src/app/[exam]/flashcards/page.tsx:278-295`; browse mode has a second callsite at `:550-576`. Both must pass the same enrichment props.
- `VocabAnswer` already knows whether a local example exists after parsing (`src/components/flashcard/vocab-answer.tsx:21-60`) and preserves the existing static example UI at `:72-88`.
- Cache-only GET is explicitly non-generating and non-quota-consuming (`src/app/api/lexicon/route.ts:43-64`). A miss is 404.
- POST already performs "generate only what is missing": entry cache first, then `headword + persona_hash` personal cache (`src/app/api/lexicon/route.ts:113-155`). A fully cached result costs no quota; a missing generic entry plus missing personal bridge can consume two quota units.
- Persona already lives under `preferences.persona` in localStorage/sync state (`src/types/storage.ts:22-27`, `src/lib/storage.ts:210-213`). The lookup page is its existing edit surface (`src/app/[exam]/lookup/page.tsx:45-59,79-97`).
- `personaHash()` treats work, interests, or goal as valid context and returns `none` only when all are blank (`src/lib/lexicon/normalize.ts:66-85`). The flashcard eligibility check should match that behavior; do not copy the lookup page's narrower work-or-interest-only check.
- The installed Next version is 15.5.19. The required `node_modules/next/dist/docs/` directory is absent from this install, so no local Next guide could be read. This design stays within already-used project patterns (`'use client'`, client `fetch`, and `next/link`) and does not introduce a new Next API. Before implementation, record this absence in the work plan; typecheck/build are the local compatibility authority unless the dependency is reinstalled with those docs.

## Proposed files

### Product code

| File | Change |
| --- | --- |
| `src/components/flashcard/vocab-example-enrichment.tsx` | New client component. Own cache-only generic lookup, explicit personal POST, state transitions, retry, quota/error copy, generic example rendering, and reuse of `PersonalBridge`. |
| `src/components/flashcard/vocab-answer.tsx` | Add optional enrichment props; keep parsing/static rendering unchanged; mount the new component only when a valid headword is available. Pass `hasStaticExample={Boolean(parsed.example)}`. |
| `src/app/[exam]/flashcards/page.tsx` | Load `preferences.persona` with the existing initial localStorage read; pass `headword`, `persona`, and `personaSetupHref={\`/${exam}/lookup\`}` to both review and browse `VocabAnswer` callsites. |

No change is required in `src/app/api/lexicon/route.ts`, migrations, lexicon types, SRS state, or the generated flashcard JSON.

### Tests

| File | Change |
| --- | --- |
| `src/__tests__/flashcard-example-enrichment.test.tsx` | New focused component integration tests around fetch boundaries and UI states. |
| `src/__tests__/vocab-answer.test.tsx` | Preserve current static example/speech assertions; add the no-local-example/additive-enrichment regression if `VocabAnswer` props change. |
| `src/__tests__/lexicon-route.test.ts` | Recommended Node-environment route contract tests for cache-only GET and cached personal POST. The route need not change, but these tests protect the cost/stability assumptions the UI relies on. |

There is no Playwright/Cypress setup, so a new E2E framework is out of scope. Use a short manual smoke test for the two page callsites.

## Props and data flow

Recommended public boundary:

```ts
interface VocabAnswerProps {
  cardId: string
  answer: string
  headword?: string
  persona?: PersonaProfile
  personaSetupHref?: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

interface VocabExampleEnrichmentProps {
  headword: string
  hasStaticExample: boolean
  persona?: PersonaProfile
  personaSetupHref: string
  speak: (text: string, id?: string) => void
  speakingId: string | null
}
```

Flow:

```text
FlashcardsContent
  reads preferences.persona once after mount
  derives word from ReviewCard.headword (extractWord remains fallback)
        |
        v
VocabAnswer
  parses and renders card.answer unchanged
  derives hasStaticExample from parsed.example
        |
        v
VocabExampleEnrichment key={headword}
  missing static example -> GET /api/lexicon?q=headword
    200 + entry.examples -> show generic supplement
    404/empty -> quiet cache miss; never auto-POST

  learner clicks "用我的情境解釋"
    blank persona -> link to /{exam}/lookup; no POST
    usable persona -> POST { term: headword, persona }
      entry.examples -> also fill generic supplement when static example is missing
      personal -> existing <PersonalBridge />
      quota/error -> local non-destructive status + retry
```

Use `key={headword}` on the enrichment child (or an equivalent explicit reset). Review mode advances cards in the same React position, so local state from one word must not leak into the next word. Abort in-flight requests on unmount/headword change; an old response must not populate a newer card.

Do not add a client-side "force regenerate" control. The existing POST intentionally returns the same cached bridge for the same persona hash; this stability is a memory feature. Editing persona creates a different hash and therefore a new bridge.

## UI behavior

### Generic layer

- Only probe GET when `hasStaticExample === false` and the answer is actually mounted/revealed.
- Show at most the first two non-empty `entry.examples` in a compact section titled **通用補充例句（AI）**. Include English, Chinese, context badge if present, and the existing speech button behavior.
- Do not render the full `EntryCard`: it would repeat/compete with the static meaning, synonyms, and exam notes. This integration is for examples, not a second dictionary card.
- GET 404 means "not cached", not a user-facing failure. Keep the personal action available.
- GET 500/network failure may show a muted **通用例句暫時讀不到** with a small retry, but must not hide the static answer or rating buttons.
- If the POST later returns `entry.examples`, use them to fill the generic section when the original card lacked an example.

### Personal layer

- CTA: **用我的情境解釋**. Nearby copy should make the cost boundary explicit: **按下後才會生成；可能計入今日額度**.
- A usable persona is any trimmed non-empty work, goal, or interest, matching `personaHash()`.
- Without usable persona, show **先設定熟悉情境** linking to `personaSetupHref`; do not send `{ persona: empty }`.
- During POST: disable duplicate clicks and show **正在用你的情境產生例句…**.
- Success: reuse `src/components/lexicon/personal-bridge.tsx`, then show the API's quota usage when present and **AI 生成內容，可能有誤**.
- The personal section is always below the static/generic layer. Static content stays visible after personal success or failure.

## State and edge cases

Keep generic and personal states separate; one failure must not erase the other.

| Case | Required behavior |
| --- | --- |
| Static card already has an example | Do not GET generic cache; still offer explicit personal bridge. |
| Missing local example, GET 200 | Show cached generic examples; no POST and no quota use. |
| GET 200 but `examples` empty | Treat as cache miss/empty; no crash and no automatic generation. |
| GET 404 | Quiet miss; personal CTA remains usable. |
| GET 400 due invalid headword | Hide enrichment or show a muted unavailable state; never POST automatically. The current IM artifact should not hit this because all cards have canonical headwords. |
| No `headword` | Preserve current `VocabAnswer` exactly and omit enrichment. Do not send an extracted comparison string such as `imply versus infer` as a fake single headword when `card.headword` is absent. |
| Persona undefined/all blank | Setup link only; POST count remains zero. Goal-only persona counts as usable. |
| POST cached generic + cached personal | Show the stable bridge; API consumes zero quota. |
| POST personal miss | API generates only personal, consumes one quota unit, stores by persona hash. |
| POST generic + personal miss | Explicit click may consume two quota units. The copy should not claim every click costs exactly one. |
| POST 429 | Preserve exact API quota message and offer retry; do not remove the static/generic answer. |
| POST 503/422/network error | Show local error and retry. Do not silently fall back to fabricated client content. |
| POST 200 without `personal` | Treat as personal-generation failure (the route intentionally lets a generic entry succeed even when personal generation fails); show retry instead of a false success state. |
| Rapid click or card advance | Disable duplicate POST; abort/ignore stale requests; reset by headword. |
| Persona changes after navigation | A remount reads the new preference; the server selects the new persona hash without overwriting old bridges. No live cross-tab synchronization is required in this minimal change. |

## Test matrix

### Required component tests

Use Jest 30 + Testing Library/jsdom. `@testing-library/user-event` is not installed, so use `fireEvent`, `findBy*`, and `waitFor`.

1. Missing static example mounts with exactly one encoded cache-only GET. A cached response shows generic English/Chinese. Assert no POST occurred.
2. Existing static example renders unchanged and does not probe GET; personal CTA remains present.
3. With persona, no POST happens before click. After click, assert exactly one POST with `Content-Type: application/json` and body `{ term: headword, persona }`; show `跟你的連結`, both languages, mnemonic, and retain the original answer.
4. Without persona (including an all-blank object), clicking/visible setup action does not POST and links to `/im/lookup`.
5. GET 404 is non-fatal and never falls through to POST.
6. POST 429 displays the server quota message and permits retry; successful retry displays the bridge.
7. POST 200 without `personal` displays a personal-generation failure, not success.
8. Rerender/change headword while a request is pending; resolving the old request must not show the old word's examples.

Avoid full-page jsdom tests for `FlashcardsPage`; there is no existing page harness and it would require brittle mocks for `use(params)`, navigation, speech, Zustand, and two fetch domains. Cover the shared component once and rely on typecheck plus manual smoke for both callsites.

### Recommended route contract tests

Follow the existing `/** @jest-environment node */` and `@opennextjs/cloudflare` mocking pattern from `src/__tests__/tts-route.test.ts`.

1. GET cached entry returns `cached: { entry: true, personal: false }` and never calls either generator or `checkAndIncrementQuota`.
2. POST cached entry + cached personal returns the same bridge with `cached.personal === true`; no generator, quota increment, or write occurs.
3. POST cached entry + personal miss invokes only `generatePersonal`/`putPersonal` and increments quota once.

### Manual smoke

1. Open `/im/flashcards?subject=im-english`, expand a card known to lack `【例句】`, and confirm Network shows GET only.
2. Confirm a cached entry displays generic examples; a 404 leaves the original answer and CTA usable.
3. Click **用我的情境解釋** and confirm the first POST happens only then; personal examples appear below the original content.
4. Enter review mode and repeat on another card to verify the same component is wired there and no previous-card state leaks.
5. Navigate to persona setup, change the context, return, and confirm the next explicit request yields the new persona-hash bridge.

## Verification snapshot

- The related product files were clean at the start of this read-only investigation. Concurrent implementation edits appeared in `src/app/[exam]/flashcards/page.tsx` and `src/components/flashcard/vocab-answer.tsx` before the report was finalized; this investigation did not create or alter those product edits. Line references above describe the inspected pre-implementation snapshot and may shift after those edits.
- Focused existing baseline executed during this investigation:
  `pnpm exec jest src/__tests__/vocab-answer.test.tsx src/__tests__/lexicon-store.test.ts src/__tests__/lexicon-normalize.test.ts src/__tests__/saved-words.test.ts --runInBand`
- Result: 4 suites, 44 tests passed.

## Implementation order

1. Add the focused component tests first, especially the no-automatic-POST assertion.
2. Add `VocabExampleEnrichment` and make all request state abort-safe.
3. Extend `VocabAnswer` and wire persona/headword/setup href into both flashcard callsites.
4. Add route contract tests; run focused Jest, `pnpm run typecheck`, and `pnpm run lint` scoped/fixed only as appropriate for the dirty repository.
5. Run the two-surface manual smoke and record results in the implementation plan.
