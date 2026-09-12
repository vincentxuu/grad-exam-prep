# Speech playback diagnosis

## Scope

- [x] Trace flashcard pronunciation click handler and speech hook
- [x] Inspect the production page and speech endpoint behavior
- [x] Compare current working tree with the deployed behavior
- [x] Identify the root cause with reproducible evidence
- [x] Fix D1 cache-hit binary response without regenerating cached MP3s
- [x] Add and run cache-hit regression coverage

## Constraints

- Diagnosis only until the cause is established.
- Preserve unrelated working-tree changes.

## Progress

- 2026-08-16: Started investigation from the reported production flashcards page.
- 2026-08-16: Production POST `/api/tts` returned 200, `audio/mpeg`, cache hit, and a 25,101-byte ASCII comma-separated number string.
- 2026-08-16: Confirmed the D1 cache-hit branch passes a `number[]` directly to `Response`, which stringifies it instead of returning MP3 bytes.
- 2026-08-16: Confirmed the client silently cleans up `audio.play()` decode failures, explaining the no-feedback UI.
- 2026-08-16: Updated the cache-hit branch to reconstruct a `Uint8Array` from D1's documented `number[]` BLOB representation.
- 2026-08-16: Added route-level byte preservation coverage; Jest, TypeScript, Biome, and diff checks pass.
