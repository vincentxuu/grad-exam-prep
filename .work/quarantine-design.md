# IM-English low-diversity quarantine design

## Executive recommendation

Quarantine a card only when all of the following are true:

1. `subjectId` is an English subject (at minimum `im-english` for this cleanup).
2. Its normalized **first prompt paragraph** is an ASCII English cloze stem:
   it contains an ASCII letter and a blank of at least three underscores, and
   contains no non-ASCII characters.
3. More than five cards in that subject share the same normalized stem.

Normalize deterministically by taking the text before the first blank line,
collapsing whitespace, and trimming. NFKC normalization and ASCII case folding
may be added for future-proofing; neither changes the counts in the current
artifact.

This guarded rule quarantines **3,116 cards in 13 groups**, retaining **2,336 of
5,452** IM-English cards. It avoids the nine legitimate cards that a naive
first-paragraph rule would catch.

This must be a quarantine/data cleanup, not a UI-time dedupe. The full prompts
are unique and many individual options are grammatically invalid even though
their complete strings differ.

## Exact impact

Counts below were computed against the checked-in `HEAD` version of
`public/data/flashcards.json` before the working-tree cleanup.

| Normalized English cloze stem | Cards |
|---|---:|
| `The professor emphasized the importance of _____ in the research methodology.` | 2,833 |
| `The report described the situation as _____ and requiring immediate attention.` | 40 |
| `Experts noted that the _____ of the new approach could significantly impact outcomes.` | 38 |
| `The committee decided to _____ the existing regulations to address new challenges.` | 30 |
| `The _____ between the two proposals was immediately apparent to observers.` | 28 |
| `The organization aims to _____ its operations to improve overall efficiency.` | 26 |
| `The professor emphasized the importance of maintaining _____ standards.` | 26 |
| `Researchers found _____ evidence to support the original hypothesis.` | 25 |
| `The government plans to _____ additional resources to the affected areas.` | 22 |
| `The _____ of the new policy was immediately evident to all stakeholders.` | 15 |
| `The _____ of the project depends on securing adequate funding.` | 13 |
| `The government allocated funds to address the _____ in public healthcare.` | 13 |
| `The report highlighted a significant _____ between expected and actual results.` | 7 |
| **Total** | **3,116** |

Additional provenance checks:

- All 3,116 IDs use the generated `fc-im-vocab-*` namespace.
- All 3,116 were introduced by commit `8152288`; none existed in its parent,
  which had 80 IM-English cards.
- None has a non-null `pastPaperRef`.
- All use the generated structured-answer format.
- 2,833 contain the placeholder example
  `This is an example of ... in academic context.`
- The remaining 283 occur in `vocab-flashcards-expanded.json`; they are still
  low-diversity synthetic cloze cards and belong in this containment batch.
- Topic breakdown: 2,391 `im-english-domain`, 442 `im-english-reading`, 283
  `im-english-vocab-cloze`.

Some cards in these groups may happen to form an acceptable sentence, but there
is no evidence that any are hand-authored or past-paper sourced. Quarantine is
still appropriate because the batch as a whole violates the diversity gate.

## False-positive analysis

A naive rule that groups every normalized first paragraph reused more than five
times removes **3,125 cards in 14 groups**. The extra group contains these nine
pre-existing, likely hand-authored cards:

`fc-im-english-026` through `fc-im-english-030`, and
`fc-im-english-067` through `fc-im-english-070`.

They share only the instructional heading
`克漏字：選出最適合填入空格的詞彙。`; their actual English questions in the
second paragraph are all distinct and their answers contain bespoke
explanations. They existed before commit `8152288`. They must be retained.

The ASCII-English-cloze guard is safer than hard-coding an ID prefix or commit
membership: it protects instructional headings in any language while continuing
to detect newly generated English cloze-template floods.

## Threshold boundary and residual risk

The `> 5` rule intentionally permits a stem to occur five times. One obviously
synthetic stem currently sits exactly at that boundary:

`There has been growing _____ about the effectiveness of the current approach.`

Its five cards are therefore retained. There are also several two-card groups
whose extracted stem is a fragment such as `30.` or `...?`; these arise from
reading-context extraction and are not evidence of duplicate questions.

Consequently, this quarantine is immediate containment, not a certification that
all 2,336 retained cards are high quality. A later source/POS/semantic audit is
still required.

## Acceptance metrics

The cleanup should be accepted only when all of these checks pass:

1. **Deterministic delta:** starting from the pre-cleanup artifact, the guarded
   stem rule identifies exactly 13 groups and 3,116 IDs; total cards go from
   5,932 to 2,816 and IM-English cards from 5,452 to 2,336.
2. **Zero false-positive control loss:** all nine `fc-im-english-*` control cards
   listed above remain byte-for-byte present.
3. **No published threshold breach:** the post-cleanup artifact contains zero
   ASCII English cloze stems reused more than five times within a subject.
4. **No placeholder examples:** zero answers match the banned generated example
   pattern.
5. **Integrity:** IDs remain unique; every retained card still references a valid
   exam and subject; no unrelated subject count changes.
6. **Idempotence:** rerunning the prune command on the cleaned artifact removes
   zero additional cards and produces no file change.
7. **Regression tests:** include cases for six matching stems (rejected), five
   matching stems (retained), placeholder answers (rejected), and a repeated
   non-ASCII instructional heading with distinct English questions (retained).

## Verification observed in the current working tree

- The cleanup dry run reports `removed: 0`, `placeholderExamples: 0`, and no
  repeated stem groups after the first write.
- Content validation exits successfully.
- `pnpm exec jest scripts/__tests__/flashcard-quality.test.ts --runInBand`
  passes four tests.

The first attempted `vitest` command was irrelevant because this repository uses
Jest; the Jest invocation above is the authoritative test result.
