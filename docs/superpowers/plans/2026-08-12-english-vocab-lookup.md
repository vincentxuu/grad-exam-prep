# English Vocabulary Lookup & Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the five pain points in the handwritten note into shipped features — arbitrary word/phrase lookup with deep entries, personalized example sentences, one-tap SRS capture, a reading-assist mode, and a conversation-practice mode that forces the saved words back out.

**Design doc:** `docs/superpowers/specs/2026-08-12-english-vocab-lookup-design.md`

**Architecture:** AI-generated lexicon entries cached permanently in Cloudflare D1, split into a globally-shared generic layer (`lexicon_entries`, keyed by headword) and a per-persona layer (`lexicon_personal`, keyed by headword + persona hash). Looked-up words become SRS cards with id `lx-<slug>`, reusing the existing SM-2 engine and localStorage `srsState` map with no migration. Conversation practice pulls due cards as target words, streams a text reply, and runs correction as a separate structured call so the stream stays token-by-token.

**Two shippable halves.** Tasks 0–13 are lookup + reading (migration `0003`). Tasks 14–17 are conversation (migration `0004`). The second half depends on the first (it reuses the lookup panel and the `ReviewCard` abstraction), but the first ships on its own if you want to stop there.

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
| Create | `migrations/0004_chat.sql` | D1 schema: chat sessions, messages, corrections |
| Create | `src/types/chat.ts` | `ChatSession`, `ChatMessage`, `Correction`, `SessionSummary` |
| Create | `src/lib/chat/prompts.ts` | Cacheable system prompts for conversation + correction |
| Create | `src/lib/chat/target-words.ts` | Pick target words from SRS; detect usage in a message |
| Create | `src/lib/chat/store.ts` | D1 read/write for sessions, messages, corrections |
| Create | `src/lib/chat/converse.ts` | Streaming reply; separate structured correction call |
| Create | `src/app/api/chat/session/route.ts` | `POST` open a session, pick targets, return opening line |
| Create | `src/app/api/chat/[id]/route.ts` | `GET` full history |
| Create | `src/app/api/chat/[id]/message/route.ts` | `POST` user message → SSE stream of the reply |
| Create | `src/app/api/chat/[id]/correct/route.ts` | `POST` structured correction for one user message |
| Create | `src/app/api/chat/[id]/end/route.ts` | `POST` end session → `SessionSummary` |
| Create | `src/components/chat/message-bubble.tsx` | Renders a message; every word tappable → lookup |
| Create | `src/components/chat/correction-block.tsx` | Collapsible corrections under a user message |
| Create | `src/components/chat/session-summary.tsx` | End-of-session recap + one-tap actions |
| Create | `src/components/chat/composer.tsx` | Text input + optional `SpeechRecognition` mic |
| Create | `src/app/[exam]/chat/page.tsx` | Conversation practice page |
| Create | `scripts/warm-lexicon.js` | Batches API pre-warm for the 160 existing exam words |
| Modify | `src/types/storage.ts` | Add `SavedWord`, `savedWords`, `PersonaProfile` on `UserPreferences` |
| Modify | `src/lib/storage.ts` | `addSavedWord` / `removeSavedWord` / `getSavedWords` |
| Modify | `src/store/flashcard.ts` | Operate on `ReviewCard[]` instead of `Flashcard[]` |
| Modify | `src/app/[exam]/flashcards/page.tsx` | Merge static cards with saved lexicon cards |
| Modify | `src/components/layout/header.tsx` | Add 查詞 / 閱讀 / 對話 nav links |
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

## Task 13: Docs, config, verification — phase 1 (lookup + reading)

**This is a shippable stopping point.** Everything through here is lookup, reading assist, and SRS capture; conversation is Tasks 14–18.

- [ ] **Step 1:** README — add `ANTHROPIC_API_KEY` (wrangler secret) and `LEXICON_DAILY_QUOTA` to the secrets table; note that `0003_lexicon.sql` must be applied manually before deploy.
- [ ] **Step 2:** `npm run typecheck` and `npm run lint` clean.
- [ ] **Step 3:** `npm test` — all existing tests pass, plus the new normalize/store tests.
- [ ] **Step 4:** `npm run preview` and walk the full loop end-to-end: paste a paragraph → tap an inflected word → entry generates → personal bridge reflects the persona → add to 單字庫 → it appears due in 閃卡 → rate it → it schedules forward.
- [ ] **Step 5:** Re-run the same lookups and confirm the second pass is served from cache (`cached.entry: true`) with no API spend.

---

## Task 14: Chat schema, types, target words

**Files:** Create `migrations/0004_chat.sql`, `src/types/chat.ts`, `src/lib/chat/target-words.ts`, `src/lib/chat/store.ts`

- [ ] **Step 1:** Write `0004_chat.sql` exactly as in the design doc (three tables + three indexes, all `IF NOT EXISTS`). Apply locally and verify the schema.
- [ ] **Step 2:** `src/types/chat.ts` with `Correction`, `ChatMessage`, `ChatSession`, `SessionSummary`.
- [ ] **Step 3:** `target-words.ts` — `pickTargetWords(cards, n = 6)`: prefer due cards, then cards with `repetitions === 0` (last rated 不會), then recently added. Return headwords only.
- [ ] **Step 4:** Same file — `detectUsedWords(message, targets)`: case-insensitive match on each target plus the regular inflections (`-s`, `-es`, `-ed`, `-ing`, and the doubled-consonant and `y→ied` variants). Use word boundaries so `act` doesn't match `contract`.
- [ ] **Step 5:** `store.ts` — create/read/end sessions, append messages, append corrections, load full history ordered by `created_at`. Enforce the 30-message-per-session cap here, not in the UI.
- [ ] **Step 6:** Unit tests for `detectUsedWords`: `"intercepted"` matches target `intercept`; `"contract"` does **not** match target `act`; `"studied"` matches `study`. Assert the known gap explicitly — `"took"` does not match `take` — so the limitation is documented in a test rather than discovered later.

---

## Task 15: Conversation generation layer

**Files:** Create `src/lib/chat/prompts.ts`, `src/lib/chat/converse.ts`

- [ ] **Step 1:** `prompts.ts` — two constant system prompts.
  - **Conversation:** an English conversation partner for a Taiwanese learner. Given `PersonaProfile` and target words, hold a natural conversation on the topic and weave the target words in. **Explicitly instruct: never list the target words, never announce which words are being practiced, never quiz.** If the user is told, they copy instead of produce, and the whole exercise is worthless.
  - **Correction:** given one learner sentence, return `Correction[]`. Only flag things that matter (grammar, word choice, collocation, register, naturalness) — not stylistic preference. Return an empty array when the sentence is fine; do not manufacture findings.
- [ ] **Step 2:** `converse.ts` → `streamReply(session, history, userMessage)`:
  - `client.messages.stream`, `model: 'claude-opus-5'`, `max_tokens: 8000`
  - System array with `cache_control: { type: 'ephemeral' }`
  - **Multi-turn cache breakpoint:** also put `cache_control` on the last content block of the most recent turn, so each request reads the whole prior conversation from cache. Without this the history is re-billed in full every turn.
  - Return the stream; the route adapts it to SSE.
- [ ] **Step 3:** `converse.ts` → `correctMessage(userMessage)`: a separate non-streaming call with `output_config.format` bound to the `Correction[]` schema. **Send only the single message, not the history** — this keeps it small and lets its system prompt cache.
- [ ] **Step 4:** Check `stop_reason === 'refusal'` before reading content in both paths; on the streaming path check `stream.finalMessage()`.
- [ ] **Step 5:** Confirm `cache_read_input_tokens` is non-zero from turn 3 onward in a manual multi-turn test. Zero means the breakpoint is misplaced or something volatile is in the prefix — fix it before moving on, because this is the difference between affordable and not.

---

## Task 16: Chat API routes

**Files:** Create the five routes under `src/app/api/chat/`

- [ ] **Step 1:** `POST /api/chat/session` — read persona + saved words from the body (client owns localStorage), pick target words, insert the session, generate the opening line, return `{ session, opening }`.
- [ ] **Step 2:** `POST /api/chat/[id]/message` — append the user message, run `detectUsedWords`, stream the reply back as SSE, and append the assistant message once the stream completes. Persist even if the client disconnects mid-stream.
- [ ] **Step 3:** `POST /api/chat/[id]/correct` — structured correction for one message id; store and return `Correction[]`.
- [ ] **Step 4:** `GET /api/chat/[id]` and `POST /api/chat/[id]/end` (computes `SessionSummary` from stored messages).
- [ ] **Step 5:** Quota — a separate `CHAT_DAILY_QUOTA` (env, default 40 messages/day) counted in `lexicon_quota` under a distinct key so chat spend can't be masked by lookup spend. Same `PASSPHRASE_HASH` bypass. 429 with a readable Chinese message.
- [ ] **Step 6:** Enforce the 30-message session cap: return a `sessionFull` flag rather than an error, so the UI can offer 結束並看總結.
- [ ] **Step 7:** Verify SSE actually streams through OpenNext on Workers — `wrangler.json` already routes `/api/*` with `run_worker_first`, but confirm no buffering. If streaming can't be made to work, fall back to a non-streaming reply and note it; do not ship a version that appears to hang.

---

## Task 17: Chat UI

**Files:** Create the four components under `src/components/chat/` and `src/app/[exam]/chat/page.tsx`; modify `src/components/layout/header.tsx`

- [ ] **Step 1:** `message-bubble.tsx` — reuse `tokenize` from Task 10 so every word in an assistant message is tappable and opens the existing lookup panel. Do not write a second tokenizer or a second lookup path.
- [ ] **Step 2:** `correction-block.tsx` — collapsed by default under the user's message; shows `original → corrected`, the `kind` badge, and the Chinese explanation.
- [ ] **Step 3:** `composer.tsx` — textarea + send. Add a mic button **only when** `window.SpeechRecognition || window.webkitSpeechRecognition` exists; hide it entirely otherwise rather than showing a broken control.
- [ ] **Step 4:** Page — session setup (topic, 糾錯模式 toggle defaulting to off), message list, composer. Add a `SpeakButton` on assistant messages using the existing `useSpeech`.
- [ ] **Step 5:** `session-summary.tsx` — used / missed target words, corrections grouped by `kind`, new words. One-tap 「記為熟悉」 for used words and 「加入單字庫」 for new ones. **Neither fires automatically** — the user's review schedule is not something to change behind their back.
- [ ] **Step 6:** Add the 對話 nav link. Check mobile: the composer must stay pinned above the keyboard.

---

## Task 18: Docs, config, verification — phase 2 (conversation)

- [ ] **Step 1:** README — add `CHAT_DAILY_QUOTA`; note `0004_chat.sql` must be applied manually.
- [ ] **Step 2:** `npm run typecheck`, `npm run lint`, `npm test` all clean.
- [ ] **Step 3:** End-to-end: save a few words → start a conversation → confirm the target words appear naturally and are **not** announced → use one in a reply → tap an unknown word in the AI's message and get a lookup → enable 糾錯模式 and get a correction on a deliberately wrong sentence → end → summary shows used/missed correctly.
- [ ] **Step 4:** Cost check — run one full 20-message session and record actual token spend from `usage`, including cache reads. Report the real number; it decides whether `CHAT_DAILY_QUOTA: 40` is sane or nonsense.

---

## Tuning (after it works, not before)

- [ ] Sweep `output_config.effort` across `low` / `medium` / `high` on a fixed set of ~20 terms and compare entry quality against cost. Opus 5 is unusually strong at the low end — but establish the `high` baseline first.
- [ ] Measure cache hit rate after a week of real use; adjust `LEXICON_DAILY_QUOTA` from data rather than from the guessed default of 60.
- [ ] Check `usage.cache_read_input_tokens` on burst lookups (reading mode) to confirm the system-prompt cache is actually hitting. Zero across repeated calls means a silent invalidator in the prompt prefix.
- [ ] Tune target-word count per conversation. Six is a guess — too many and the AI's replies get stilted trying to fit them all in, which defeats the "natural conversation" requirement. Watch for stilted output and drop to 4 if it shows up.
- [ ] Decide whether correction should default on. Off is the safe default for flow, but if real usage shows the same mistakes repeating across sessions, the flow cost is worth paying.
