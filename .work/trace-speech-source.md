# Flashcard speech source trace

Status: source-only diagnosis complete; no implementation files edited.

## Conclusion

The click wiring is intact. The strongest source-backed root cause is that the newly added remote D1 migration `0006_tts_cache.sql` was not applied. The Cloudflare TTS route queries `tts_cache` before it calls Workers AI, so a missing table makes every request return 502. The client then reduces that failure to `console.error('[TTS speak]', Error('TTS failed'))` and immediately clears the pulse state, with no user-visible error; from the UI this looks exactly like "clicked but no sound."

This is a high-confidence inference from repository state, not a live production confirmation. A live `POST /api/tts` response or Worker log would distinguish it immediately.

## Exact execution path

1. `src/components/flashcard/speak-button.tsx:27-30`: the button stops card-row propagation and calls `speak(text, id)`.
2. `src/app/[exam]/flashcards/page.tsx:298-300, 321-380`: the page passes the single `useSpeech()` callback into every expanded flashcard and into `VocabAnswer`; there is no disconnected handler in the screenshot path.
3. `src/hooks/use-speech.ts:162-186`: Cloudflare is the default/restored provider, `stop()` runs, `speakingId` is set, and `fetchServerTts(...)` starts.
4. `src/hooks/use-speech.ts:246-259`: the browser posts `{ text, provider, voice }` to `/api/tts`; any non-2xx is collapsed to `Error('TTS failed')`.
5. `src/app/api/tts/route.ts:47-56`: the endpoint obtains bindings and immediately executes `SELECT audio FROM tts_cache`.
6. `src/app/api/tts/route.ts:92-95`: any DB/binding/AI/cache-insert failure is collapsed to JSON 502.
7. `src/hooks/use-speech.ts:207-210`: that 502 is logged only in DevTools and speaking state is cleared. No toast/message reaches the user.
8. Only a successful response reaches `src/hooks/use-speech.ts:188-205`, where the Blob gets an object URL and `audio.play()` is called.

## Evidence for missing migration

- `migrations/0006_tts_cache.sql:1-5` creates the table that `route.ts:53-56, 80-83` assumes exists.
- The table and route arrived together in commit `f757f82` (`feat(tts): Cloudflare AI TTS ...`) on 2026-08-16 11:59 +08.
- `.github/workflows/deploy.yml:47-53` deploys the Worker but has no migration step.
- `README.md:206-213` explicitly says D1 migrations are not in automatic deployment and must be applied manually.
- Git history contains no later workflow or migration change that would apply `0006` remotely.

Therefore a normal push to `main` can deploy the Cloudflare UI/API while leaving production without `tts_cache`. Because the query happens before `env.AI.run`, even a valid AI binding cannot produce audio in that state.

## Other risks / secondary findings

- `src/app/api/tts/route.ts:80-83` waits for the D1 cache insert before returning generated audio. Any BLOB binding/write failure also turns otherwise valid generated speech into 502. Cache persistence should not be on the critical playback path if graceful degradation is desired.
- `src/hooks/use-speech.ts:205` catches `audio.play()` rejection but does not log or display it, so autoplay/codec failures are also silent. However playback is initiated from a user click and the API failure path better matches the just-added migration/deploy gap.
- `wrangler.json:10-18` has both `AI` and `DB` bindings for the default environment used by this workers.dev hostname; `.github/workflows/deploy.yml:47-49` confirms deploy runs without `--env`. A missing AI binding is therefore less likely from source.
- `src/__tests__/vocab-answer.test.tsx:18-27` checks only that speech buttons exist. It passes `jest.fn()` as `speak` and never clicks through `useSpeech`, `/api/tts`, Blob playback, or error UX. There are no `useSpeech` or TTS route tests in the repository.
- Commit `879068b` only improved audio cleanup and caught `audio.play()` rejection. It did not change the API request or DB dependency, so it cannot repair a 502 caused by an unapplied migration.

## Fast confirmation and remedy for parent agent

- Confirm live: inspect `POST /api/tts` for `ambivalent` in DevTools Network. Expected under this diagnosis: HTTP 502 with `{ "error": "語音生成失敗" }`; Worker log should mention missing `tts_cache`/`no such table`.
- Confirm DB: list/apply D1 migrations remotely. The repository-documented apply pattern is `npx wrangler d1 migrations apply grad-exam-prep-db --remote` (`README.md:206-210`). This mutates production and was not performed in this source-only subtask.
- Immediate user workaround: switch provider from `Cloudflare AI` to `瀏覽器語音`; that takes the `SpeechSynthesisUtterance` branch at `src/hooks/use-speech.ts:168-179` and bypasses `/api/tts` and D1 entirely.

