# English Vocabulary Lookup & Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the five pain points in the handwritten note into shipped features — arbitrary word/phrase lookup with deep entries, personalized example sentences, one-tap SRS capture, and a reading-assist mode.

**Design doc:** `docs/superpowers/specs/2026-08-12-english-vocab-lookup-design.md`

**Architecture:** AI-generated lexicon entries cached permanently in Cloudflare D1, split into a globally-shared generic layer (`lexicon_entries`, keyed by headword) and a per-persona layer (`lexicon_personal`, keyed by headword + persona hash). Looked-up words become SRS cards with id `lx-<slug>`, reusing the existing SM-2 engine and localStorage `srsState` map with no migration.

**Tech Stack:** Next.js (OpenNext/Cloudflare Workers), Cloudflare D1, `@anthropic-ai/sdk`, TypeScript, Tailwind, existing shadcn/ui components.

**Model:** `claude-opus-5`. Note thinking is on by default and `max_tokens` caps thinking + response text together — budget accordingly.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `migrations/0003_lexicon.sql` | D1 schema: entries, aliases, personal, quota |
| Create | `src/types/lexicon.ts` | `LexiconEntry`, `LexiconSense`, `LexiconExample`, `PersonalBridge`, `PersonaProfile` |
| Create | `src/lib/lexicon/normalize.ts` | Headword normalization, slug, persona hashing |
| Create | `src/lib/lexicon/schema.ts` | JSON Schemas for structured output |
| Create | `src/lib/lexicon/prompts.ts` | Cacheable system prompts for entry + personal bridge |
| Create | `src/lib/lexicon/generate.ts` | Anthropic client, refusal handling, fallbacks |
| Create | `src/lib/lexicon/store.ts` | D1 read/write for entries, aliases, personal, quota |
| Create | `src/app/api/lexicon/route.ts` | `GET` cache read, `POST` generate + cache |
| Create | `src/components/lexicon/entry-card.tsx` | Renders a `LexiconEntry` (senses, collocations, confusables, examples + TTS) |
| Create | `src/components/lexicon/personal-bridge.tsx` | Renders a `PersonalBridge` |
| Create | `src/components/lexicon/lookup-panel.tsx` | Search box + result + "加入單字庫" |
| Create | `src/components/lexicon/persona-form.tsx` | Edit interests / work / goal |
| Create | `src/app/[exam]/lookup/page.tsx` | Standalone lookup page |
| Create | `src/app/[exam]/reading/page.tsx` | Paste passage → tokenize → tap → lookup → save |
| Create | `src/lib/reading/tokenize.ts` | Offset-preserving tokenizer |
| Create | `src/lib/review-card.ts` | Unified `ReviewCard` + adapters from `Flashcard` and `SavedWord` |
| Create | `scripts/warm-lexicon.js` | Batches API pre-warm for the 160 existing exam words |
| Modify | `src/types/storage.ts` | Add `SavedWord`, `savedWords`, `PersonaProfile` on `UserPreferences` |
| Modify | `src/lib/storage.ts` | `addSavedWord` / `removeSavedWord` / `getSavedWords` |
| Modify | `src/store/flashcard.ts` | Operate on `ReviewCard[]` instead of `Flashcard[]` |
| Modify | `src/app/[exam]/flashcards/page.tsx` | Merge static cards with saved lexicon cards |
| Modify | `src/components/layout/header.tsx` | Add 查詞 / 閱讀 nav links |
| Modify | `wrangler.json` | No change needed for D1; document `ANTHROPIC_API_KEY` secret |
| Modify | `README.md` | Document the new secret + migration step |

---

## Task 0: Read the framework docs first

`AGENTS.md` warns this Next.js version has breaking changes vs. training data. `node_modules` is not installed in a fresh clone.

- [ ] **Step 1:** `npm install`
- [ ] **Step 2:** Read the route-handler and app-router guides under `node_modules/next/dist/docs/` before writing any route or page. Heed deprecation notices.
- [ ] **Step 3:** Confirm the existing routes in `src/app/api/` still match current conventions; if they don't, note the delta before adding new ones.

---

## Task 1: D1 schema

**Files:** Create `migrations/0003_lexicon.sql`

- [ ] **Step 1:** Write the four tables exactly as specified in the design doc (`lexicon_entries`, `lexicon_aliases`, `lexicon_personal`, `lexicon_quota`), all with `IF NOT EXISTS`.
- [ ] **Step 2:** Add `CREATE INDEX IF NOT EXISTS idx_lexicon_personal_headword ON lexicon_personal(headword);`
- [ ] **Step 3:** Apply locally: `npx wrangler d1 migrations apply grad-exam-prep-db --local`
- [ ] **Step 4:** Verify with `npx wrangler d1 execute grad-exam-prep-db --local --command ".schema"`

**Note:** migrations are not in the deploy workflow — remote apply is a manual step (README already says this).

---

## Task 2: Types and normalization

**Files:** Create `src/types/lexicon.ts`, `src/lib/lexicon/normalize.ts`

- [ ] **Step 1:** Write `src/types/lexicon.ts` with the interfaces from the design doc.
- [ ] **Step 2:** Write `normalizeTerm(raw: string): { term: string; kind: 'word' | 'phrase' }` — trim, lowercase, collapse internal whitespace, strip surrounding punctuation but keep internal apostrophes and hyphens. `kind` is `'phrase'` when the result contains a space.
- [ ] **Step 3:** Write `slugify(headword: string): string` → `lx-` prefix is added by the caller; slug is lowercase with non-alphanumerics collapsed to `-`.
- [ ] **Step 4:** Write `async personaHash(p: PersonaProfile | null): Promise<string>` — returns `'none'` for null/empty; otherwise SHA-256 (via `crypto.subtle`) of `JSON.stringify({ interests: [...p.interests].sort(), work: p.work, goal: p.goal ?? '' })`, first 16 hex chars. **Sorting matters** — same interests in a different order must share a cache entry.
- [ ] **Step 5:** Unit tests in `src/__tests__/lexicon-normalize.test.ts`: `"Intercepted."` → `intercept ed`? No — assert `normalizeTerm` does *not* lemmatize (that's the model's job); assert `"  Take   Into Account "` → `take into account` / `phrase`; assert persona hash is order-independent and stable.

---

## Task 3: Generation layer

**Files:** Create `src/lib/lexicon/schema.ts`, `src/lib/lexicon/prompts.ts`, `src/lib/lexicon/generate.ts`

- [ ] **Step 1:** Install the SDK: `npm install @anthropic-ai/sdk`
- [ ] **Step 2:** `schema.ts` — JSON Schema objects for `LexiconEntry` (plus a `queried_as` / `headword` pair so the model reports the lemma) and `PersonalBridge`. Every object needs `additionalProperties: false` and a `required` list. Avoid unsupported constraints (`minLength`, `minimum`, `minItems`) — express "at least 3 examples" in the prompt text, not the schema.
- [ ] **Step 3:** `prompts.ts` — two constant system prompts. Write them for a Taiwanese graduate-exam learner reading books, articles, and papers. The entry prompt must demand: the lemma, multiple senses with 詞性 and both 中文 + English glosses, collocations, derived phrases, confusable words with a distinguishing note, and **at least three example sentences spanning different registers** (general / academic / technical). These requirements are the direct answer to 「用法不夠多、解釋太少」— do not let them degrade to one gloss and one sentence.
- [ ] **Step 4:** `generate.ts` — `generateEntry(term)` and `generatePersonal(headword, persona)`:
  - `client.beta.messages.create` with `betas: ['server-side-fallback-2026-07-01']` and `fallbacks: 'default'`
  - `model: 'claude-opus-5'`, `max_tokens: 8000`
  - `output_config: { format: { type: 'json_schema', schema: ... } }`
  - `system` as an array with one text block carrying `cache_control: { type: 'ephemeral' }`
  - **Check `response.stop_reason === 'refusal'` before touching `response.content`** — return a typed error, don't index into content.
  - Read the API key from `env.ANTHROPIC_API_KEY` via `getCloudflareContext`, not `process.env`.
- [ ] **Step 5:** Verify the beta `fallbacks` parameter composes with `output_config.format` in one request. If the API rejects the combination, drop `fallbacks` and handle `stop_reason: 'refusal'` client-side; record which way it went in a comment.

---

## Task 4: D1 store

**Files:** Create `src/lib/lexicon/store.ts`

- [ ] **Step 1:** `getEntry(db, term)` — look up `lexicon_entries` by term first, then `lexicon_aliases` → entry. Return `null` on miss (including an orphan alias whose entry is gone).
- [ ] **Step 2:** `putEntry(db, entry, model, queriedAs)` — insert the entry under its lemma, then insert an alias **only if** `queriedAs !== entry.headword` **and** `queriedAs` is not already an entry headword. Use `ON CONFLICT DO NOTHING` on both.
- [ ] **Step 3:** `getPersonal(db, headword, hash)` / `putPersonal(db, bridge, hash)`.
- [ ] **Step 4:** `checkAndIncrementQuota(db, userId, limit)` — read today's row (UTC `YYYY-MM-DD`), return `{ allowed, used, limit }`, and increment via `INSERT ... ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1`. Increment only when a generation will actually run.
- [ ] **Step 5:** Unit tests for the alias-collision rule with a stubbed D1 — a query for an existing headword must never write an alias that shadows another entry.

---

## Task 5: API route

**Files:** Create `src/app/api/lexicon/route.ts`

- [ ] **Step 1:** `GET` — read `q`, normalize, `getEntry`. Hit → `{ entry, cached: { entry: true, personal: false } }`. Miss → 404. No quota, no auth.
- [ ] **Step 2:** `POST` — body `{ term, persona? }`. Normalize, then:
  - `getEntry`; if miss, gate on quota (or bypass with a valid `PASSPHRASE_HASH` bearer token via the existing `validateBearerToken`), generate, `putEntry`.
  - If `persona` is present and non-empty: compute hash, `getPersonal`; if miss, gate + generate + `putPersonal`.
  - Return `LookupResponse` with accurate `cached` flags and remaining quota.
- [ ] **Step 3:** Error handling — 400 on empty/oversized `term` (cap at 80 chars), 429 with a Chinese message on quota exhaustion, 503 on refusal, 500 otherwise. Follow the existing routes' shape: `NextResponse.json({ error }, { status })`.
- [ ] **Step 4:** Add `ANTHROPIC_API_KEY` and `LEXICON_DAILY_QUOTA` to `cloudflare-env.d.ts` (or regenerate with `npm run cf-typegen`).
- [ ] **Step 5:** Manual verification against a local dev server: a cold term generates, the same term a second time returns `cached.entry: true`, an inflected form (`intercepted` after `intercept`) hits the alias path.

---

## Task 6: Persona storage

**Files:** Modify `src/types/storage.ts`, `src/lib/storage.ts`

- [ ] **Step 1:** Add `PersonaProfile` (imported from `@/types/lexicon`) as an optional field on `UserPreferences`, and add `savedWords: SavedWord[]` to `StorageState`. Define `SavedWord` in `src/types/storage.ts`.
- [ ] **Step 2:** Extend `defaultState()` with `savedWords: []`. The existing `{ ...defaultState(), ...JSON.parse(raw) }` merge already handles old payloads that lack the key.
- [ ] **Step 3:** Add `addSavedWord`, `removeSavedWord`, `getSavedWords` to `IStorage` and `localStorageImpl`. `removeSavedWord` must also delete the card's `srsState` entry.
- [ ] **Step 4:** Confirm `exportJSON` / `importJSON` and `/api/sync` carry the new fields — they serialize the whole `StorageState`, so this should be free. Verify rather than assume.

---

## Task 7: Unify the SRS card source

**Files:** Create `src/lib/review-card.ts`; modify `src/store/flashcard.ts`

- [ ] **Step 1:** Define `ReviewCard { id, source: 'content' | 'lexicon', prompt, subjectLabel, render }` plus `fromFlashcard(card)` and `fromSavedWord(word)` adapters.
- [ ] **Step 2:** Change `getDueCards` / `getDueCount` / `reviewCard` in `src/store/flashcard.ts` to accept `ReviewCard`. **Do not change `src/lib/srs.ts`** — SM-2 is keyed by `cardId` string and needs no edits.
- [ ] **Step 3:** Update existing call sites to wrap with `fromFlashcard`.
- [ ] **Step 4:** Run the existing flashcard tests (`src/__tests__/`) — the discrepancy card added in `eec8baa` must still pass. Fix regressions before moving on.

---

## Task 8: Lexicon UI components

**Files:** Create `src/components/lexicon/{entry-card,personal-bridge,lookup-panel,persona-form}.tsx`

- [ ] **Step 1:** `entry-card.tsx` — headword + IPA + `SpeakButton`; senses as a numbered list with 詞性 badges; collocations and derived phrases as chips; confusables in a bordered block; examples with per-sentence `SpeakButton` and a register badge. Reuse `useSpeech` and the existing `SpeakButton` — don't build a second TTS path.
- [ ] **Step 2:** `personal-bridge.tsx` — visually distinct from the generic entry (this is *the user's* connection to the word), showing the personalized examples and the mnemonic.
- [ ] **Step 3:** `persona-form.tsx` — interests (tag input), work (text), goal (optional text); persists via `setPreferences`. Include a short line explaining what it's for: 例句會用你填的情境改寫。
- [ ] **Step 4:** `lookup-panel.tsx` — input + submit; on submit `GET` first, fall back to `POST` on 404; loading skeleton; "加入單字庫" button; a "重新生成" affordance that warns it counts against quota. Handle 429 and 503 with readable Chinese messages.
- [ ] **Step 5:** Verify both light and dark themes (`next-themes` is in use).

---

## Task 9: Lookup page

**Files:** Create `src/app/[exam]/lookup/page.tsx`; modify `src/components/layout/header.tsx`

- [ ] **Step 1:** Page shell matching the flashcards page conventions (`Suspense` + `PageLoading`, `use(params)`, `notFound()` on an unknown exam).
- [ ] **Step 2:** Mount `LookupPanel` plus a collapsed `PersonaForm`.
- [ ] **Step 3:** List `savedWords` below with SRS due state, mirroring the flashcards coverage panel.
- [ ] **Step 4:** Add a 查詞 nav link to the header.

---

## Task 10: Reading assist

**Files:** Create `src/lib/reading/tokenize.ts`, `src/app/[exam]/reading/page.tsx`

- [ ] **Step 1:** `tokenize(text): Token[]` where `Token = { text, start, end, isWord }`. Split on `/[^A-Za-z'-]+/` while preserving offsets so the original passage renders unchanged (whitespace and punctuation intact).
- [ ] **Step 2:** Page: a textarea for the passage (persisted to localStorage), and a rendered view where word tokens are clickable buttons.
- [ ] **Step 3:** Click a word → open the side panel with `LookupPanel` pre-filled. Drag-select across words → offer a "查片語" action for the selected span (this is the 片語 half of pain point 1 — don't skip it).
- [ ] **Step 4:** Underline tokens whose normalized form is in `savedWords`, or whose SRS state has `repetitions === 0` (last rated 不會). Add a legend.
- [ ] **Step 5:** Add a 閱讀 nav link to the header.
- [ ] **Step 6:** Check mobile layout — the side panel should become a bottom sheet on narrow screens.

---

## Task 11: Merge saved words into flashcards

**Files:** Modify `src/app/[exam]/flashcards/page.tsx`

- [ ] **Step 1:** Build the review queue from `[...examCards.map(fromFlashcard), ...savedWords.map(fromSavedWord)]`.
- [ ] **Step 2:** Add a 我的單字（N） filter alongside the existing subject filters.
- [ ] **Step 3:** In review mode, lexicon cards fetch their entry from `GET /api/lexicon` and render with `EntryCard`; content cards keep rendering `VocabAnswer`. Cache fetched entries in component state so a review session doesn't refetch.
- [ ] **Step 4:** Keep the rating buttons and SM-2 flow identical for both sources.

---

## Task 12: Warm the cache

**Files:** Create `scripts/warm-lexicon.js`

- [ ] **Step 1:** Extract headwords from the 160 `*-english` cards in `flashcards.json` using the existing `extractWord` in `src/lib/vocab.ts`. Log any card it can't extract from rather than silently dropping it.
- [ ] **Step 2:** Submit them via the Message Batches API (`client.messages.batches.create`, 50% cost) with the same schema and system prompt as the live path, `custom_id` = headword.
- [ ] **Step 3:** Poll to `ended`, write results to `public/data/lexicon-seed.json`. Results arrive in arbitrary order — key by `custom_id`, never by position. Skip `errored` / `expired` entries and report them.
- [ ] **Step 4:** Push into D1: `npx wrangler d1 execute grad-exam-prep-db --remote --file=...` (generate the SQL from the seed JSON, as `scripts/write-missing-answers.js` does for answers).
- [ ] **Step 5:** Report actual counts — how many headwords extracted, generated, failed. No silent truncation.

---

## Task 13: Docs, config, verification

- [ ] **Step 1:** README — add `ANTHROPIC_API_KEY` (wrangler secret) and `LEXICON_DAILY_QUOTA` to the secrets table; note that `0003_lexicon.sql` must be applied manually before deploy.
- [ ] **Step 2:** `npm run typecheck` and `npm run lint` clean.
- [ ] **Step 3:** `npm test` — all existing tests pass, plus the new normalize/store tests.
- [ ] **Step 4:** `npm run preview` and walk the full loop end-to-end: paste a paragraph → tap an inflected word → entry generates → personal bridge reflects the persona → add to 單字庫 → it appears due in 閃卡 → rate it → it schedules forward.
- [ ] **Step 5:** Re-run the same lookups and confirm the second pass is served from cache (`cached.entry: true`) with no API spend.

---

## Tuning (after it works, not before)

- [ ] Sweep `output_config.effort` across `low` / `medium` / `high` on a fixed set of ~20 terms and compare entry quality against cost. Opus 5 is unusually strong at the low end — but establish the `high` baseline first.
- [ ] Measure cache hit rate after a week of real use; adjust `LEXICON_DAILY_QUOTA` from data rather than from the guessed default of 60.
- [ ] Check `usage.cache_read_input_tokens` on burst lookups (reading mode) to confirm the system-prompt cache is actually hitting. Zero across repeated calls means a silent invalidator in the prompt prefix.
