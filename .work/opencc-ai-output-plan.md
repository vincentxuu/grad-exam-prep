# OpenCC AI output conversion plan

## Goal

Normalize all AI-generated Chinese from Simplified Chinese to Taiwan Traditional Chinese before it reaches API responses, D1 caches, or chat history.

## Design

- Use the pure-JavaScript `opencc-js` package so the converter can run in Cloudflare Workers without native binaries.
- Use Mainland Simplified → Taiwan Traditional with phrase conversion (`cn` → `twp`).
- Convert complete non-streaming text and recursively convert strings in structured output.
- Wrap chat streams at the shared LLM boundary; buffer through sentence boundaries so phrases split across transport chunks are converted together.
- Preserve all provider routing and fallback behavior.

## Verification

- Unit tests for plain text, Taiwan phrase conversion, nested structured values, and split stream chunks.
- Focused LLM/chat tests, typecheck, scoped Biome.
- Next and OpenNext Cloudflare production builds; compare Worker bundle size.

## Status

- [x] Trace current output boundaries.
- [x] Confirm a pure-JavaScript OpenCC implementation is required for Workers.
- [x] Install and integrate `opencc-js`.
- [x] Add regression tests.
- [x] Run verification.

## Verification result

- OpenCC/LLM/store focused suites: 6 passed, 65 tests passed.
- Scoped Biome, diff check, and focused TypeScript project passed.
- Next production build and OpenNext Cloudflare build passed.
- Final Worker handler: 15,564,972 bytes raw / 3,743,739 bytes gzip.
- Full Jest run: 33 suites passed; 4 unrelated IM-IT suites fail against concurrently edited lesson/review data.
- Repository-wide `npm run typecheck` is blocked only by the unrelated IM-IT learning test expecting fields absent from the current dirty-worktree JSON.
