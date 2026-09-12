# Cloudflare AI / Luna speech path audit

## Scope

Source/config/test-only audit of the screenshot path: flashcard `SpeakButton` -> `useSpeech` with provider `cloudflare`, voice `luna` -> `POST /api/tts` -> Workers AI Aura 2 -> D1 cache -> browser `Audio.play()`.

## Result

The click wiring is present and correct. The strongest source-backed failure is a deployment/schema gap: every TTS request reads the new `tts_cache` table before calling Workers AI, while the production deploy workflow never applies D1 migrations. If migration `0006_tts_cache.sql` was not applied manually, `/api/tts` always returns 502 and the UI silently resets, exactly appearing as “clicked but no sound.”

There is also a separate response-contract defect/risk: Aura-2 is declared by the installed Cloudflare runtime types to return `string`, but the route asserts that the result is `ReadableStream | ArrayBuffer | Uint8Array`. A string falls into the “stream” branch and is converted by `new Response(string).arrayBuffer()`, which does not explicitly decode or validate the declared audio representation. This can yield an invalid MP3 body that still returns HTTP 200.

## Evidence

### 1. UI click reaches `speak`

- `src/components/flashcard/speak-button.tsx:19-30`: real button, click stops propagation then calls `speak(text, id)`.
- `src/app/[exam]/flashcards/page.tsx:49`: page receives `speak` from `useSpeech`.
- `src/app/[exam]/flashcards/page.tsx:136-143` and `361+`: the flashcard word button receives text/id/speak.
- Therefore the screenshot symptom is not explained by a missing handler.

### 2. Screenshot selection resolves to server TTS with Luna

- `src/hooks/use-speech.ts:34-45`: Luna is the first Cloudflare voice.
- `src/hooks/use-speech.ts:68-76,92-95`: Cloudflare is a valid and default provider.
- `src/hooks/use-speech.ts:123-133`: if no stored valid voice exists, first provider voice is selected, i.e. `luna`.
- `src/hooks/use-speech.ts:168-180`: only `browser` uses Web Speech; Cloudflare continues to the server path.
- `src/hooks/use-speech.ts:182-205,246-259`: it POSTs `{ text, provider, voice }` to `/api/tts`, builds a Blob URL, then calls `audio.play()`.

### 3. Most probable root cause: migration 0006 is not part of deployment

- `migrations/0006_tts_cache.sql:1-5`: `tts_cache` is introduced here; it is not an existing built-in table.
- `src/app/api/tts/route.ts:47-66`: the first provider operation is an unconditional `SELECT audio FROM tts_cache`; there is no missing-table fallback.
- `src/app/api/tts/route.ts:92-95`: any error, including `no such table: tts_cache`, is collapsed into JSON `{ error: '語音生成失敗' }` with HTTP 502.
- `.github/workflows/deploy.yml:32-53`: CI installs, typechecks, checks papers, tests, and deploys. It never runs `wrangler d1 migrations apply`.
- `README.md:200-213`: repository documentation explicitly says D1 migrations are not automatic and must be applied manually; absent tables make corresponding APIs fail.
- Git history: commit `f757f82` added the route and `0006_tts_cache.sql` together. The deploy workflow does not close that schema gap.

Expected browser symptom: `fetchServerTts` sees non-OK and throws only `Error('TTS failed')` (`src/hooks/use-speech.ts:252-259`); the catch only logs to DevTools and clears state (`207-210`). There is no toast or inline error, so the user sees no audible or visible explanation.

Confidence: **high as a code/deployment failure mode, most probable current root cause; production migration state was outside this source-only audit and remains to be checked.**

### 4. Independent response-contract problem: Aura-2 output is asserted to the wrong union

- `node_modules/@cloudflare/workers-types/index.d.ts:10652-10721`: installed Cloudflare types declare Aura-2 input and `Ai_Cf_Deepgram_Aura_2_En_Output = string`; line 10719 calls it generated MP3 audio.
- `node_modules/@cloudflare/workers-types/index.d.ts:11040-11045`: a normal known-model `AI.run` resolves to that model's `postProcessedOutputs`.
- `src/app/api/tts/route.ts:68-78`: the call intentionally erases the known model typing, then asserts the result is only `ReadableStream | ArrayBuffer | Uint8Array`; there is no string branch.
- A runtime string reaches the final branch and is passed to `new Response(...)`. That may encode the string's characters rather than decode the audio representation. No magic-byte, length, or decode validation exists before cache/response.
- `src/app/api/tts/route.ts:80-91`: those bytes are permanently cached and returned as `Content-Type: audio/mpeg`, so a bad first result can become repeatably silent on cache hits.

Confidence: **medium**. The static contract mismatch is definite. Whether Workers' runtime string is directly MP3-compatible cannot be proved without invoking the live/local binding, which this audit was asked not to do.

### 5. Voice catalog contains four names disallowed by the installed Aura-2 input contract

- App catalog: `src/hooks/use-speech.ts:34-45`; server accepts same list at `src/app/api/tts/route.ts:4-7`.
- Installed Aura-2 allowed names: `node_modules/@cloudflare/workers-types/index.d.ts:10656-10696`.
- Unsupported app entries under that contract: `stella`, `helios`, `perseus`, `angus`.
- Supported screenshot voice: `luna`, so this does **not** explain the pictured Luna failure. It will cause provider failures for those four other choices.

### 6. Failures are deliberately invisible in the page

- `src/hooks/use-speech.ts:195-205`: media `error` and rejected `audio.play()` only call cleanup; the rejection reason is discarded.
- `src/hooks/use-speech.ts:207-210`: fetch/provider failures only call `console.error` and clear `speakingId`.
- `src/components/flashcard/speak-button.tsx:16,33-35`: the only user-visible state is a temporary pulsing icon.
- Thus HTTP 502, invalid MP3, decode failure, and autoplay rejection converge to the same user symptom: no sound and no explanation.

### 7. Test gap

- `src/__tests__/` contains no TTS, speech hook, `/api/tts`, audio response, or migration coverage.
- The deploy test step (`.github/workflows/deploy.yml:42-45`) therefore cannot catch a missing `tts_cache` migration, a 502 from the route, an unsupported voice, or an invalid audio body.

## Recommended verification order for the parent task

1. Check the production D1 applied migrations / existence of `tts_cache`. This is the fastest discriminator and most probable cause.
2. POST one Luna request and inspect status, `Content-Type`, `X-TTS-Cache`, body length, and first bytes. A 502 strongly supports the migration/binding branch; 200 with non-MP3 bytes supports the output conversion branch.
3. Inspect Worker logs for `[tts cloudflare]` (route line 93).
4. Only after the backend body is proven valid, investigate browser playback policy/device mute.

No implementation files were edited during this audit.
