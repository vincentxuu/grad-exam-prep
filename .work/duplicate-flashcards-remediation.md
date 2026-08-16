# Duplicate flashcards remediation

## Goal

Define a safe, implementable fix for the low-diversity IM English flashcard batch.

## Plan

- [x] Confirm supported flashcard formats and vocabulary rendering behavior.
- [x] Identify a safe quarantine rule for the defective batch.
- [x] Define a reproducible rebuild pipeline from authoritative vocabulary/context data.
- [x] Define validation gates that prevent recurrence.
- [x] Recommend rollout order and acceptance criteria.

## Proposal

### 1. Immediate containment

- Remove/quarantine all 2,833 records whose first paragraph equals the known
  `research methodology` fallback template.
- Also reject answers containing `This is an example of ... in academic context.`
- Keep IDs stable for any rebuilt cards so existing SRS state remains attached.
- Do not solve this in the UI with `Set(prompt)`: the full prompts are unique and
  many cards are grammatically invalid, so display-time dedup would hide only the
  symptom.

### 2. Rebuild card format

- Real past-paper item available: use the original question/context and answer.
- Reliable contextual sentence available: make a cloze only after target POS and
  distractor POS are verified.
- Word-list/domain-only word: use a direct recall card rather than a fake multiple
  choice question. Front: `abscond（動詞）`; back: traditional Chinese meaning,
  POS, one natural example, and optional synonyms/antonyms/source.
- The existing `extractWord` and `VocabAnswer` already support the direct-card
  prompt and structured answer format, so this does not require a new review UI.

### 3. Reproducible pipeline

- Check in a deterministic generator under `scripts/`; never commit a large
  generated JSON batch without its generator and manifest.
- Inputs should be the master vocabulary plus authoritative past-paper contexts
  and/or validated lexicon entries.
- Emit provenance and quality metadata (source kind, source reference, generator
  version, validation status), then publish only active/validated cards to the
  runtime file.

### 4. Validation gates

- Unique IDs and valid references (existing checks).
- Reject banned placeholder examples and empty meaning/POS fields.
- Normalize the first paragraph and fail if a cloze stem is reused above a small
  threshold (recommended max 5 and max 1% of a subject).
- Ensure the answer word fills the blank and agrees with the required POS.
- Ensure distractors have the same POS but are not also valid answers.
- Record exact counts by source/status and require a reviewed sample before
  publishing.

### Rollout

1. Ship quarantine first to restore trust immediately.
2. Rebuild high-priority `must_know` / `important` and actual exam-sourced words.
3. Add domain/supplement words as direct recall cards in smaller reviewed batches.
4. Re-run duplicate/template analysis and UI smoke tests before deployment.

## Implemented outcome

- Removed 3,116 cards across 13 overused ASCII English cloze stems.
- Retained all 9 pre-existing curated cards that share a Chinese instruction header.
- IM English runtime cards changed from 5,452 to 2,336; all runtime cards changed
  from 5,932 to 2,816.
- The screenshot stem now occurs 0 times; placeholder examples now occur 0 times.
- Added a reusable quality helper, idempotent cleanup CLI, validator integration,
  and focused regression tests.
- Quality cleanup is recoverable from git history; no SRS records were rewritten,
  and stable IDs can be reused when vetted replacements are added later.

## Verification

- Focused quality tests: 8 passed.
- Full Jest suite: 244 passed.
- TypeScript: passed.
- Content validation: passed (existing topic-reference warnings remain).
- Production build: passed outside the sandbox because the configured Next build
  starts a remote Wrangler proxy.
- Full Biome lint remains red on unrelated pre-existing scripts; the newly added
  quality helper, cleanup CLI, and tests pass a scoped Biome check.

## Remaining work

- One synthetic stem occurs exactly 5 times and is allowed by the agreed maximum.
- Remaining generated cards have not received a full semantic/grammar audit.
- Rebuild quarantined vocabulary as direct recall cards in smaller reviewed batches.
