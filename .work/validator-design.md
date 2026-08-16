# Flashcard content validator design

## Scope and findings

`scripts/validate-content.js` currently validates flashcard IDs and references only. It does
not inspect prompt or answer quality. The existing Jest suite lives in `src/__tests__`, only
matches `.test.ts`/`.test.tsx`, and commonly imports JSON or pure helpers directly.

Current data confirms both target defects:

- `im-english` has 5,452 cards.
- 2,833 answers contain the exact generated placeholder shape
  `This is an example of <word> in academic context.`
- 2,833 prompts share the first paragraph
  `The professor emphasized the importance of _____ in the research methodology.`
- Other repeated first paragraphs include counts 40, 38, 30, 28, 26, etc., so a fixed
  maximum catches the smaller template batches after the largest one is removed.
- There is a legitimate counterexample: 9 curated cards share the instructional first
  paragraph `克漏字：選出最適合填入空格的詞彙。`, while their actual sentences are in the
  second paragraph. Counting every first paragraph would reject these good cards.

## Recommended structure

Add a small CommonJS pure-helper module, for example
`scripts/lib/flashcard-content-quality.js`, and call it from `scripts/validate-content.js`.
Test it from `src/__tests__/flashcard-content-quality.test.ts` with `require(...)`; the current
Jest config does not discover JavaScript tests.

Suggested API:

```js
const PLACEHOLDER_EXAMPLE_PATTERNS = [
  /^this is an example of\s+.+?\s+in\s+(?:an?\s+)?academic context[.!?]?$/i,
]

function normalizedFirstParagraph(prompt) {
  return String(prompt ?? '')
    .trim()
    .split(/\r?\n\s*\r?\n/, 1)[0]
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

function labeledExampleLines(answer) {
  return String(answer ?? '')
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:【例句】|例句[：:])\s*(.+?)\s*$/)?.[1])
    .filter(Boolean)
}

function isFillBlankStem(stem) {
  // Restrict repetition checks to a question-bearing paragraph. In particular,
  // do not count a shared instructional header whose actual question is later.
  return /_{3,}|＿{3,}|\[blank\]/i.test(stem)
}

function findPlaceholderExamples(cards) {
  return cards.flatMap((card) =>
    labeledExampleLines(card.answer).some((line) =>
      PLACEHOLDER_EXAMPLE_PATTERNS.some((pattern) => pattern.test(line))
    )
      ? [{ id: card.id, subjectId: card.subjectId }]
      : []
  )
}

function findRepeatedFillBlankStems(cards, maxOccurrences = 5) {
  const groups = new Map()
  for (const card of cards) {
    const stem = normalizedFirstParagraph(card.prompt)
    if (!isFillBlankStem(stem)) continue
    const key = `${card.subjectId}\u0000${stem}`
    const group = groups.get(key) ?? { subjectId: card.subjectId, stem, ids: [] }
    group.ids.push(card.id)
    groups.set(key, group)
  }
  return [...groups.values()].filter((group) => group.ids.length > maxOccurrences)
}

module.exports = {
  findPlaceholderExamples,
  findRepeatedFillBlankStems,
  labeledExampleLines,
  normalizedFirstParagraph,
}
```

Keep the placeholder signature deliberately narrow and inspect only explicitly labeled
example lines. A broad `/This is an example of/` over the whole answer would incorrectly
reject explanations that legitimately discuss an example. Additional known generator
signatures can be added to the pattern array when observed.

Group repeated stems by `subjectId`, not globally. Normalize Unicode and whitespace, but do
not replace the blank or other words: the rule is intended to catch effectively identical
questions, not merely sentences that share a linguistic template.

Use a fixed maximum of 5 exact repeated, question-bearing stems. A percentage-only rule has
bad edge cases: one unique card is already 1.25% in an 80-card subject, while 40 repeats are
only 0.73% of the currently bloated 5,452-card subject. The fixed limit is both predictable
and aligned with the remediation requirement. Include the percentage in diagnostics rather
than using it as the gate.

## Integration into `validate-content.js`

After the existing per-card reference loop:

```js
const {
  findPlaceholderExamples,
  findRepeatedFillBlankStems,
} = require('./lib/flashcard-content-quality')

for (const card of findPlaceholderExamples(flashcards)) {
  err(`Flashcard ${card.id} contains a generated placeholder example`)
}

const flashcardCountBySubject = new Map()
for (const card of flashcards) {
  flashcardCountBySubject.set(
    card.subjectId,
    (flashcardCountBySubject.get(card.subjectId) ?? 0) + 1
  )
}

for (const group of findRepeatedFillBlankStems(flashcards, 5)) {
  const total = flashcardCountBySubject.get(group.subjectId) ?? 0
  const percentage = total ? ((group.ids.length / total) * 100).toFixed(2) : '0.00'
  err(
    `Flashcard stem repeats ${group.ids.length} times in ${group.subjectId} ` +
      `(${percentage}%, max 5): "${group.stem}"; examples: ${group.ids.slice(0, 5).join(', ')}`
  )
}
```

One error per placeholder card would produce 2,833 lines. For usable CI output, preferably
aggregate placeholder matches by signature and subject, show total count plus the first five
IDs, and still make the result fatal. For example:

```text
Flashcard placeholder example occurs 2833 times in im-english; examples:
fc-im-english-..., fc-im-english-...
```

## Required tests

Add `src/__tests__/flashcard-content-quality.test.ts` covering:

1. Reject an explicitly labeled exact placeholder:
   `【例句】This is an example of autonomous in academic context.`
2. Reject the colon label variant:
   `例句：This is an example of inference in an academic context.`
3. Accept a natural labeled example such as
   `【例句】The committee inferred the cause from the available evidence.`
4. Accept prose elsewhere in an answer that says `This is an example of ...`; only a labeled
   example line is quality-checked.
5. Six cards in one subject with the same first-paragraph blank stem are returned as an
   error; five are accepted.
6. CRLF and extra whitespace normalize to the same stem.
7. Identical stems in different subjects are counted independently.
8. Nine cards whose first paragraph is the shared instruction
   `克漏字：選出最適合填入空格的詞彙。` are accepted because that paragraph has no blank.
9. Direct vocabulary cards without a fill-in blank are not grouped even if their first
   paragraph happens to repeat.

Also keep one data-level regression test (or an integration assertion in the same file) that
loads `public/data/flashcards.json` and expects zero placeholder matches and zero excessive
stem groups after cleanup. This prevents the bad batch from returning even if the standalone
validator is not invoked in a developer's local test command.

## Verification commands

```sh
pnpm test -- --runInBand src/__tests__/flashcard-content-quality.test.ts
pnpm validate:content
pnpm lint
```

Expected post-cleanup result: zero placeholder signatures, no fill-blank first-paragraph stem
occurring more than five times per subject, and the existing nine curated `克漏字` cards
remaining valid.

## Mandatory required-vocabulary coverage contract

Removing bad generated cards must not silently shrink the required study syllabus. The
authoritative source is `public/data/ntu-im-vocab-master.json`, whose metadata currently
defines 17 `must_know` and 319 `important` entries. Treat those two tiers as the required
flashcard target (336 unique words at the current source version); do not infer the target
set from whichever cards happen to survive pruning.

Make the target tiers explicit in one place, preferably source metadata such as
`flashcardTargetTiers: ["must_know", "important"]`. The validator/generator should read that
field. If changing the source schema is out of scope, define and export one
`REQUIRED_IM_VOCAB_TIERS` constant used by both generator and validator, rather than copying
the tier list into multiple scripts.

Each required word needs one explicit card mapping. Do not use `extractWord(prompt)` as the
coverage authority: it is a UI speech heuristic and cannot reliably distinguish cloze cards,
phrases, aliases, and changed prompt wording. Recommended options, in preference order:

1. Add explicit source metadata to generated flashcards, e.g.
   `vocabTarget: { source: "ntu-im-vocab-master", word: "mitigate", tier: "must_know" }`.
2. If the public card schema must stay unchanged, commit a mapping manifest from canonical
   source word to card ID. Every non-obvious alias must include a human-readable reason.

Use deterministic IDs such as `fc-im-vocab-${slugify(canonicalWord)}`. At present the 336
required words are unique and their normalized slugs have no collisions. Still fail loudly
on a future slug collision; never resolve it by array order or a numeric suffix that can
change after regeneration. A committed override map may resolve a collision, but each entry
must state the canonical word, stable card ID, and reason.

Suggested pure validator result:

```js
function validateRequiredVocabCoverage(master, flashcards, overrides = {}) {
  const targetTiers = new Set(master.metadata.flashcardTargetTiers)
  const required = master.words.filter((entry) => targetTiers.has(entry.tier))
  const requiredByWord = groupBy(required, (entry) => canonicalWord(entry.word))
  const mappedCards = flashcards.filter(
    (card) => card.vocabTarget?.source === 'ntu-im-vocab-master'
  )
  const cardsByWord = groupBy(mappedCards, (card) => canonicalWord(card.vocabTarget.word))

  // Fatal invariants:
  // - source itself has no duplicate canonical required word
  // - every required word maps to exactly one existing card
  // - no non-required word claims required-target provenance
  // - each card ID is unique and equals deterministic ID or a documented override
  // - card examId/subjectId are im/im-english and its recorded tier matches the source
  // - every mapped card also passes placeholder/repeated-stem/basic content checks
}
```

Coverage diagnostics must be aggregated and actionable, for example:

```text
Required IM vocabulary coverage: 331/336 (98.51%)
Missing (5): circumspect, corroborate, credulous, delineate, parsimonious
Duplicate mappings (1): mitigate -> fc-im-vocab-mitigate, fc-im-vocab-mitigate-2
Unstable IDs (1): substantiate expected fc-im-vocab-substantiate, got fc-im-vocab-042
```

Add tests that prove:

1. All 336 current `must_know` + `important` source entries have exactly one mapped card.
2. Removing one required card fails and names the missing word.
3. Mapping one word to two cards fails and names both IDs.
4. An extra card cannot falsely increase the numerator.
5. Tier drift between master and card is detected.
6. Reordering the master word array does not change generated IDs.
7. Regenerating twice yields the same word-to-ID manifest byte-for-byte.
8. Canonicalization handles case/whitespace consistently, while an explicit alias or slug
   collision requires a documented override.
9. Every mapped card passes `extractWord`/render expectations if the product uses direct
   memory-card prompts, but `extractWord` is not used to decide coverage.
10. A data-level snapshot asserts source count, mapped count, unique canonical words, and
    unique IDs; update it only when the authoritative tier definition intentionally changes.

Because SRS progress is keyed only by card ID, stable IDs are also a migration contract. Add
a regression test that gives a required word an existing SRS state, regenerates/reloads the
card set, and confirms the same ID still resolves that state.
