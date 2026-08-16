# Duplicate flashcards diagnosis

## Goal

Explain why the IM English flashcard list contains many questions with the same sentence stem.

## Workstreams

- [x] Trace the flashcard page query, rendering, and deduplication behavior.
- [x] Trace the source/generated vocabulary flashcard data and generation pipeline.
- [x] Compare records quantitatively to distinguish exact duplicates from template repetition.
- [x] Record the root cause and evidence; do not modify product behavior yet.

## Findings

### Root cause

Commit `8152288` expanded `public/data/flashcards.json` from 560 to 5,932 cards and
the IM English subset from 80 to 5,452 cards. Of those IM English cards, 2,833
(51.96%) have the identical first-line template:

`The professor emphasized the importance of _____ in the research methodology.`

They are not exact duplicate JSON records: all 5,452 IM English IDs are unique and
there are no repeated full prompts. The four randomized choices make each full
prompt distinct. The validator only rejects duplicate IDs and invalid references;
it does not check repeated stems, semantic validity, grammar, or distractor quality.

All 2,833 cards with this stem also use the fallback answer example
`This is an example of <word> in academic context.` This strongly identifies a
bulk-generation fallback template rather than source exam questions. Their master
vocabulary sources are 2,402 `domain` entries plus 431 supplementary word-list
entries; none are direct `english-exam`/`both` entries.

### Why the UI shows them consecutively

`src/lib/content.ts` imports `flashcards.json` verbatim. The flashcard page filters
that array by exam and subject while preserving file order, then renders every
record with `.map()`. It performs no prompt/stem deduplication or quality filter.
Therefore a block of bulk-generated records appears as a wall of the same sentence.

### Additional quality signal

Random distractors and the one-size-fits-all template create semantically or
grammatically invalid questions such as putting verbs/adverbs/proper names after
`importance of`. So hiding only exact duplicates would not solve the underlying
content-generation problem.
