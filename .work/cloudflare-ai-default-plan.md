# Cloudflare Workers AI default plan

## Goal

Make Cloudflare Workers AI the application's built-in LLM default and call it through the existing `AI` binding (`env.AI`) instead of Cloudflare's REST API token flow. Keep D1/env provider overrides and all other providers available.

## Scope

- Change the code default to `cloudflare` and a currently supported Workers AI chat model.
- Route Cloudflare generation, streaming, ping, trial chat, and model discovery through `env.AI`.
- Treat the `AI` binding as Cloudflare's credential/capability check.
- Update provider metadata, environment examples, generated environment comments, and README.
- Add focused regression tests for defaults and binding behavior.

## Constraints

- Preserve unrelated dirty-worktree changes.
- Do not mutate deployed D1 configuration or deploy without a separate request.
- Explicit D1 or environment provider/model settings continue to override code defaults.

## Verification

- Focused LLM tests
- TypeScript typecheck
- Scoped formatter/linter checks
- Production build when focused checks pass

## Status

- [x] Confirmed the current default is Groq and Cloudflare currently uses REST credentials.
- [x] Finish callsite and streaming-shape audit.
- [x] Implement direct Workers AI binding support and new defaults.
- [x] Update documentation and tests.
- [x] Run focused tests, typecheck, scoped Biome, Next production build, and OpenNext Cloudflare build.

## Verification result

- Focused LLM suites: 4 passed, 48 tests passed.
- TypeScript and scoped Biome checks passed.
- `next build` and `opennextjs-cloudflare build` completed successfully.
- Full Jest run: 33 suites passed; 3 unrelated IM-IT suites still fail because the dirty-worktree data now reports 61 subtopics / 26 corrected answers while those tests expect 58 / 44.
