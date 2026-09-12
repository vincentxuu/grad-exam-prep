# IM English flashcard pre-merge audit

Audited branch: `agent/fix-flashcard-practice` at `7c60a7c`

Comparison base: `origin/main...HEAD`

## Verdict

**Ready to merge for the requested IM-English flashcard repair.** The tracked diff is confined to the flashcard data/generation/validation/UI/SRS path and its supporting documentation. No tracked audio, TTS, speech, or IM-EN-106 work is included.

The diff is large because it checks in generated vocabulary artifacts and 36 task/audit files under `.work`; those `.work` files are related to this repair, but can be omitted in a later cleanup if repository history should stay lean.

## Diff scope

- 70 tracked files: 36 `.work`, 3 `public/data`, 12 `scripts`, 15 `src`, 2 docs, 2 config/package files.
- `96,379` insertions / `22,846` deletions, dominated by `public/data/flashcards.json`, `public/data/im-vocab-lexicon.json`, curation data, and audit artifacts.
- Runtime changes are limited to flashcard loading/API, flashcard UI, vocabulary answer rendering, SRS/storage/store/types, plus associated tests.
- Supporting changes add the deterministic IM vocabulary generator, validators, ECDICT attribution, package scripts, and documentation.
- Existing unrelated untracked `.work` audio/TTS/IM-EN-106 files and `tmp/` are not part of `origin/main...HEAD`.

## Data evidence

Current branch `public/data/flashcards.json`:

- All subjects: **5,208** cards.
- `im-english`: **4,728** cards.
- Exact `The professor emphasized the importance of ...` template: **0**.
- Question-bank syntax on IM-English fronts (`___` or `(A)`-style choices): **0**.
- Duplicate normalized IM-English prompts: **0 groups / 0 cards**.
- Every sampled front is a single headword and `kind: vocabulary`.

`origin/main` comparison:

- All subjects: **5,932** cards.
- `im-english`: **5,452** cards.
- Exact professor template: **2,859**.
- Question-bank syntax on IM-English fronts: **5,114**.

Generator check reports:

- Required master entries: **4,859**.
- Curated exclusions: **131**.
- Generated/covered targets: **4,728**.
- Missing meanings: **0**.
- Other-subject cards preserved: **480**.

## Verification run

- `npm run check:im-vocab` — PASS; checked-in artifact matches deterministic generation.
- `npm run validate:content` — PASS; IM-English coverage is 4,728 and content validation completes successfully. It still prints 382 pre-existing unknown-topic warnings across other decks, but no validation errors.
- `npm run typecheck` — PASS.
- `npm test -- --runInBand` — PASS: 22 suites, 256 tests.
- Biome on the 25 changed JS/TS/TSX files — PASS (warnings only for intentional CLI `console` output).
- `npm run lint` for the entire repository — FAILS on pre-existing unrelated scripts (including a parse error in `scripts/generate-answers.js` and formatting errors in CS-English maintenance scripts). None of those error files are in this branch diff, so this is a repository-baseline issue rather than a regression from the flashcard change.

## Suitable pre-deploy commands

```bash
npm run check:im-vocab
npm run validate:content
npm run typecheck
npm test -- --runInBand
npm run build
```

`npm run lint` is not currently a reliable merge gate until the unrelated repository-baseline lint errors are repaired. For changed-file linting:

```bash
git diff --name-only origin/main...HEAD \
  | rg '\.(js|ts|tsx)$' \
  | rg -v '^\.work/' \
  | xargs npx biome check --max-diagnostics=200
```
