# Lexicon incomplete generation fix

- [x] Locate the UI error and request path.
- [x] Reproduce the incomplete response condition.
- [x] Implement a robust server-side fix with focused tests.
- [x] Run targeted and deployment-level verification.
- [x] Record the verified outcome.

## Outcome

- Root cause: the Cloudflare Workers AI adapter falls back to manual JSON generation, but the
  fallback prompt did not include the Zod/JSON schema. Parseable responses with missing or renamed
  fields therefore failed strict validation and produced the visible HTTP 422 error.
- Fix: embed `z.toJSONSchema(schema)` in the manual prompt, preserve `safeParse` before persistence,
  and retry once with concise validation paths when the first JSON response is incomplete.
- Focused verification: Biome passed; the Cloudflare LLM suite passed 5/5; typecheck passed.
- Verification on the latest `main` (`40248c2`) plus this fix: 56 suites and 410 tests passed,
  typecheck passed, paper integrity passed for 61 papers / 1,475 questions, and
  `npm run build:cf` completed 101 pages.
- Concurrent `im-english` work landed separately as `40248c2`; this fix did not edit or stage it.
