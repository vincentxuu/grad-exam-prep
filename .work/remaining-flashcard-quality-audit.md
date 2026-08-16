# Remaining IM-English flashcard quality audit

## Conclusion

The first quarantine removed the dominant repeated templates, but the remaining
2,336 cards still contain a second systemic defect: most cards added by the same
bulk commit were generated from truncated occurrence snippets and arbitrary
distractor pools. They are technically unique but often are not usable study
questions.

The safe remediation is **not another delete-only pass**. Full vocabulary
coverage is a hard requirement, so contaminated generated cards must be replaced
atomically with direct-recall cards, preserving a stable ID per master word.

The current runtime corpus consists of:

| Provenance/family | Cards | Assessment |
|---|---:|---|
| pre-existing `fc-im-english-*` | 80 | bespoke material; retain and review separately |
| generated `fc-im-vocab-*` | 1,754 | systemic structural and distractor defects |
| generated `fc-im-reading-*` | 287 | meaning question without meaning; truncated examples |
| generated `fc-im-domain-*` | 200 | nearly all prompts/examples are truncated fragments |
| generated `fc-im-phrase-*` | 15 | mostly coherent; at least one grammatical error |
| **Total** | **2,336** | |

All 2,256 non-`fc-im-english-*` survivors were introduced by commit `8152288`;
the 80 bespoke cards existed in its parent.

## Full-corpus statistics

The following counts come from `.work/audit-remaining-flashcards.mjs` against
the current 2,336 IM-English cards. Marker checks are meaningful for generated
word-card families; bespoke prose cards intentionally use different formatting.

| Defect signal | Cards |
|---|---:|
| no runtime `pastPaperRef` or other per-card provenance | 2,336 |
| generated cards missing a Chinese meaning | 1,265 / 2,256 |
| generated cards missing a non-empty POS | 935 / 2,256 |
| generated cards missing an example | 180 / 2,256 |
| first prompt paragraph contains truncation `...` | 1,630 / 2,256 |
| example contains truncation `...` | 1,910 / 2,256 |
| example still contains an unresolved blank | 415 / 2,256 |
| example still contains `(A)`-`(D)` option markers | 531 / 2,256 |
| first prompt paragraph has multiple blank runs | 413 / 2,256 |
| known placeholder sentence previously targeted | 0 remaining |

For generated word cards specifically (`fc-im-vocab-*`, `fc-im-reading-*`, and
`fc-im-domain-*`), **2,165 of 2,241 (96.61%)** fail at least one deterministic
direct-card requirement: meaning, POS, example, complete/non-truncated example,
no unresolved blank, and no option markers in the example. Only 76 pass this
minimal structural screen; that does not establish semantic correctness.

### Defects by high-volume family

| Family/topic | Cards | Key deterministic evidence |
|---|---:|---|
| `fc-im-vocab-*` / reading | 1,490 | 1,434 truncated prompts and examples; 317 unresolved example blanks; 383 examples containing options; 804 missing meaning; 687 missing POS |
| `fc-im-reading-*` / reading | 287 | all 287 fail the structural rule; 278 omit the requested meaning; 143 have an empty POS; 281 examples are truncated; 71 retain blanks; 76 retain options |
| `fc-im-domain-*` | 200 | 192 truncated prompts/examples; 18 retain blanks; 71 examples contain options; 197/200 fail the structural rule |
| `fc-im-vocab-*` / vocab-cloze | 233 | 183 missing meaning; 105 missing POS; 180 missing example; 51 prompts contain multiple blanks; 198/233 fail the structural rule |
| `fc-im-vocab-*` / polysemy | 31 | structurally complete, but still synthetic MC cards with no per-card source |

## Representative failures

- `fc-im-reading-theory` asks what *theory* means, but the answer contains no
  meaning and an empty `【詞性】`; its only content is a truncated cloze fragment.
- `fc-im-vocab-internet` starts `Wireless _____ has become so____` and ends in
  the middle of `it d`; the answer is only `【答案】(B) internet`.
- `fc-im-vocab-did-i` proposes `did i` for `There has been growing _____`; its
  POS is empty and the example leaves the blank unresolved.
- `fc-im-vocab-solicitation` uses an existing option-only fragment as its stem,
  then appends a second, unrelated option set mixing nouns and adjectives.
- `fc-im-vocab-wrapped-plastic` and `fc-im-vocab-wrapping-plastic` turn an
  already malformed multiple-choice row into another multiple-choice row.
- `fc-im-domain-router` reduces a domain context to
  `In _____-table construction...` and adds unrelated distractors such as
  *scrutiny*, *turmoil*, and *hegemony*.
- `fc-im-phrase-refer-to` says `The term "big data" refer to...`; agreement
  requires `refers to`.

These are pipeline patterns, not isolated typos.

## Distractor and grammar audit

There are 1,969 generated multiple-choice cards. POS data is incomplete, so only
811 could be mechanically compared with at least one POS-known distractor. Of
those, **431 (53.14%)** contain at least one distractor whose known POS does not
match the target, and 286 have every POS-known distractor mismatching.

The reading-generated subgroup is strongest evidence: 427 of 642 auditable
cards have a mismatch. Examples include noun target *scarcity* paired with
*questioned*, and adjective target *egregious* paired with *investigate*.

This statistic is a lower-bound signal, not a validator-ready truth source:
`ntu-im-vocab-master.json` itself has incomplete and occasionally inaccurate POS
labels (for example, it can understate a word's polysemy). Unknown POS must block
synthetic distractor generation rather than be treated as compatible.

## Provenance gap

Every current IM-English card has either missing or null `pastPaperRef`. That
alone must not quarantine the 80 bespoke cards, but it proves that the runtime
artifact cannot distinguish:

- a real past-paper sentence,
- a truncated occurrence snippet,
- an authored pedagogical example, and
- a generated fallback sentence.

The master vocabulary contains source/tier/year/context information for many
words, but the generation step dropped it from the cards. Future generated cards
need explicit `sourceKind`, `sourceRef`, and generator/lexicon version metadata.

## Vocabulary coverage contract

The master has 10,015 unique entries. Its tier metadata defines four apparent
core target tiers:

| Tier | Master | Before cleanup | Current | Coverage lost/current missing |
|---|---:|---:|---:|---:|
| `must_know` | 17 | 17 | 15 | 2 |
| `important` | 319 | 319 | 54 | 265 |
| `worth_studying` | 2,113 | 2,113 | 1,681 | 432 |
| `domain` | 2,410 | 2,410 | 156 | 2,254 |
| **Core target** | **4,859** | **4,859 (100%)** | **1,906 (39.23%)** | **2,953** |
| `gre_extra` | 4,764 | 9 | 9 | 4,755 missing |
| `skip` | 392 | 11 | 11 | 381 missing |
| **Literal full master** | **10,015** | **4,879** | **1,926 (19.23%)** | **8,089 missing** |

This establishes that the removed batch was intended to provide complete
coverage of the four core tiers, despite its bad card content.

The cleanup removed 3,116 IDs representing 3,116 unique master targets. Of
those targets, 163 still have another retained card; **2,953 no longer have any
runtime card**. Therefore:

1. At minimum, the 2,953 removed IDs whose targets are now absent must be
   regenerated as direct-recall cards before the cleanup can satisfy the former
   4,859-word core coverage contract.
2. Prefer regenerating all 3,116 removed IDs with corrected direct-recall content
   if SRS state is keyed by card ID. For the 163 overlapping targets, select one
   canonical stable ID and migrate/alias the duplicate rather than publishing two
   cards for the same word.
3. The cleanest end state is one canonical direct-recall card for every core
   master entry: reuse an existing/pre-cleanup `fc-im-vocab-*` ID for 4,858 core
   words and `fc-im-phrase-with-respect-to` for the one core phrase absent from
   that namespace.
4. If “full vocabulary” literally includes `gre_extra` and `skip`, the contract
   must be **10,015/10,015**, not 4,859/4,859; another 5,136 words outside the
   core tiers were never covered even before cleanup.

### Master enrichment blocker

Coverage cannot be restored with trustworthy cards by blindly formatting the
master as it stands:

- all master: only 4,003/10,015 have Chinese, 1,097 have POS, and 1,062 have both;
  8,953 lack at least one required field;
- core tiers: only 2,378/4,859 have Chinese, 1,096 have POS, and 1,062 have both;
  3,797 lack at least one required field.

Missing data must be enriched from a versioned lexicon or reviewed source.
Generic meanings, invented POS, or `This is an example...` fallbacks must never
be used to make the count pass.

## Recommended deterministic quarantine/replacement rules

### Immediate structural quarantine

For generated word-card namespaces, mark a card invalid if any condition holds:

1. meaning, POS, or example is empty;
2. the example contains `...`, an underscore blank, or `(A)`-`(D)` option tokens;
3. a meaning-question prompt has no meaning in its answer;
4. a cloze contains other unresolved blanks after the declared answer is filled;
5. the selected answer does not appear exactly once among the options;
6. the prompt or answer contains the banned placeholder pattern;
7. no structured provenance identifies whether the sentence is authored,
   lexicon-derived, or past-paper sourced.

Rules 1-4 deterministically flag 2,165/2,241 current generated word cards. Do not
publish that reduced set alone. Build their replacements first and swap them in
the same change.

### Family-level replacement recommendation

Because 96.61% of generated word cards fail and the remaining 76 come from the
same unreproducible pipeline, replace all 2,241 current generated word cards with
direct-recall cards rather than attempting to salvage their multiple-choice
shells. This is a content rewrite with stable IDs, not a vocabulary deletion.

Review the 15 phrase cards separately: retain coherent ones, correct
`fc-im-phrase-refer-to`, and require an inflection check for any phrase inserted
into a sentence.

### Direct-recall publication schema

Each canonical word card should include:

- exact master word/phrase and tier;
- non-empty normalized POS;
- reviewed Traditional Chinese meaning;
- one complete natural example containing the target or declared inflection;
- source kind/reference and lexicon/generator version;
- optional synonyms/antonyms only when sourced;
- stable card ID and no second active card for the same normalized master word.

Past-paper cloze questions may remain multiple choice only if the original stem,
options, answer, year, and question reference are all preserved. Do not generate
distractors for passage snippets.

## Atomic rollout and acceptance metrics

1. Generate replacement cards into a staging artifact; never temporarily ship a
   corpus below the coverage contract.
2. Validate **4,859/4,859 core targets** (and 10,015/10,015 if literal full-master
   coverage is required) before swapping files.
3. Assert exactly one active canonical card per normalized master target and
   preserve/migrate existing SRS IDs.
4. Require zero empty meanings, POS fields, or examples in generated direct cards.
5. Require zero truncated examples, unresolved blanks, option markers, and banned
   placeholder examples.
6. Require 100% structured provenance and a versioned generation manifest.
7. If any synthetic MC remains, require all four choices to have known compatible
   POS and require a reviewed semantic-distractor source; otherwise reject it.
8. Retain all 80 pre-existing `fc-im-english-*` cards and regression-test the nine
   shared-heading cloze controls from the first quarantine.

Reproduce structure statistics with `.work/audit-remaining-flashcards.mjs` and
coverage statistics with `.work/audit-vocab-coverage.mjs`.
