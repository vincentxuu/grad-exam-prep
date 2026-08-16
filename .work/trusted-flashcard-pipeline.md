# Trusted IM-English flashcard rebuild pipeline

## Decision

Rebuild the IM-English vocabulary deck from `public/data/ntu-im-vocab-master.json`, with **exactly one direct-recall card per target-tier headword**. Do not repair or sample the generated multiple-choice cards: their options, example sentences, topic assignments, and answers were synthesized without retained provenance.

The target vocabulary contract is the four non-optional study tiers declared in master metadata:

| Tier | Required words |
|---|---:|
| `must_know` | 17 |
| `important` | 319 |
| `worth_studying` | 2,113 |
| `domain` | 2,410 |
| **Total** | **4,859** |

`gre_extra` (4,764) and `skip` (392) are not in the required deck. Note that tier membership wins over `source`: 431 of the 4,859 required entries have supplemental sources but were promoted into a required tier.

## Why pruning is insufficient

The original committed deck technically covered all 4,859 target words, but did so with synthetic MCQs. The current working-tree pruning removes the worst repeated templates but also destroys vocabulary coverage:

| Coverage | Original committed IM deck | Current pruned candidate |
|---|---:|---:|
| cards | 5,452 | 2,336 |
| resolved unique target words | 4,859 | 1,908 |
| missing target words | 0 | **2,951** |
| `must_know` retained | 17/17 | 15/17 |
| `important` retained | 319/319 | 53/319 |
| `worth_studying` retained | 2,113/2,113 | 1,684/2,113 |
| `domain` retained | 2,410/2,410 | 156/2,410 |

Therefore the safe fix is replacement, not deletion: keep all non-IM-English flashcards unchanged, replace the IM-English vocabulary portion with 4,859 deterministic cards, and handle non-vocabulary practice separately.

## Provenance audit

### Runtime and auxiliary artifacts

Original IM-English runtime provenance by exact row match / ID family:

| Bucket | Cards | Trust judgment |
|---|---:|---|
| original `fc-im-english-NNN` seed cards | 80 | hand-authored pedagogical content, but no cited source; keep only as a separately reviewed practice set |
| `vocab-flashcards.json` | 267 | generated MCQs; not authoritative |
| `vocab-flashcards-expanded.json` | 782 | generated MCQs; some examples reproduce source snippets, but distractors and template sentences are synthetic |
| other bulk-generated rows | 4,323 | generated; contains the 2,833-copy fallback template and placeholder answers |

All 267 base and 782 expanded rows were copied into the original runtime file. Neither auxiliary file is loaded by the app; `src/lib/content.ts` imports only `flashcards.json`.

The auxiliary files are useful only as audit evidence, not rebuild inputs. Across their 916 unique resolved target words, they could appear to fill 114 missing Chinese fields and 392 missing POS fields, but those values were produced by the same unretained generator. Only a heuristic 365/763 expanded examples could be traced back to raw question text; synthetic examples must not be promoted into the trusted deck.

### Master vocab field completeness

For the 4,859 required entries:

| Field / provenance | Available | Missing |
|---|---:|---:|
| Chinese (`chinese`) | 2,378 | **2,481** |
| POS (`pos`) | 1,096 | **3,763** |
| both Chinese and POS | 2,412 have at least one | **2,447 lack both** |
| `englishExam.contexts` | 1,950 | 2,909 |
| `domain.context` | 2,943 | 1,916 |
| either master context | 4,371 | 488 |

Missing Chinese is concentrated in domain-source words (2,343/2,481). Missing POS is widespread: all 2,421 domain-source entries and all 431 supplemental-source target entries lack POS.

### Raw exam traceability

`public/data/questions.json` is the canonical local question source; the repository `.gitignore` describes `qfiles/` as regenerable. Current `questions.json` has 1,475 total questions, including exactly 500 IM-English questions (50 each for years 106–115). There are only 1,449 qfiles, so qfiles cannot be the sole inventory authority.

Exact case-insensitive headword/phrase matching against the 1,475 raw question texts gives:

- 2,842 target words occur in an IM-English question.
- 3,452 occur in another subject's question.
- 4,474 unique target words occur in at least one raw question and can receive a cited, verbatim context.
- 385 have no raw-question occurrence: 218 GRE supplement, 93 GRE online, 70 Verbal Advantage, 3 vocabulary-power supplement, and 1 TOEFL supplement.
- Every target entry that has a master context also has a raw-question match. Thus the raw question, not the truncated master snippet, should supply the displayed source context.

### Lexicon availability and limitations

The local Wrangler D1 database does not contain the `lexicon_entries` table; migration `0003_lexicon.sql` has not been applied locally, so there is no local cached lexicon dataset to join during a reproducible build.

The available lexicon path is an LLM generator (`src/lib/lexicon/generate.ts`) whose output is cached in D1 with model ID and timestamp. Its schema provides senses/POS/Chinese and at least three generated examples, but has no citation/source field. It is useful for enrichment, not authority. Never silently replace exam context with an LLM example or present generated content as a past-paper sentence.

## Deterministic rebuild design

### 1. Freeze and validate inputs

Inputs, in authority order:

1. `ntu-im-vocab-master.json`: membership, normalized headword, tier, frequency, years, existing Chinese/POS.
2. `questions.json`: canonical verbatim context and stable `question.id`/paper/year reference.
3. `im-english-vocab-v2.json` and `im-domain-vocab.json`: derived cross-checks only; fail if their source metadata contradicts master.
4. `qfiles/`: per-question integrity cross-check where present, never inventory authority.
5. reviewed lexicon enrichment snapshot: optional fill for missing Chinese/POS/examples, explicitly marked generated.
6. auxiliary flashcard JSONs: excluded from generated output; audit/regression fixtures only.

At build start, record SHA-256 hashes for every input and write a manifest containing generator version, target tier list, counts, and timestamp. Sort the final inventory by tier rank then normalized headword; do not rely on object/file insertion history.

### 2. Build the exact target inventory

- Filter master words to `must_know | important | worth_studying | domain`.
- Normalize headwords with NFKC + trim + lowercase for identity, preserving original display spelling.
- Generate stable ID `fc-im-master-<slug>`; current data has zero slug collisions across master, but collision detection remains a hard failure.
- Emit exactly one card per normalized headword. Duplicate target words, duplicate IDs, or cardinality other than 4,859 fail the build.
- Use valid topic `im-en-vocab` from `subjects-im.json`, not the generated `im-english-*` topic IDs, which are not declared subject topics.

### 3. Use direct recall, never fabricated MCQ

Recommended card shape:

```text
prompt: "mitigate（must_know）是什麼意思？請回想詞性與真題用法。"

answer:
【中文】減輕；緩和
【詞性】v
【來源語境】...verbatim text selected from q-pp-im-en-115-...
【來源】q-pp-im-en-115-N（115 年台大資管英文）
```

Rules:

- No blanks, `(A)/(B)/(C)/(D)` choices, randomized distractors, or generic sentence templates.
- Copy Chinese/POS byte-for-byte from master when present; never infer them in the deterministic generator.
- If Chinese/POS is absent, emit an explicit `待詞典補全` marker and enrichment status. The card still exists, preserving 100% inventory coverage, but cannot masquerade as complete.
- Add `pastPaperRef` using the selected question ID/year. A better follow-up schema would add structured `sourceQuestionIds`, `sourceKind`, and `enrichmentStatus`; until then, encode the stable reference in `pastPaperRef` and a build manifest.

### 4. Select source context reproducibly

For each headword, search `questions.json` with escaped, case-insensitive lexical boundaries. Rank candidates deterministically:

1. For `must_know`, `important`, and `worth_studying`, prefer IM-English questions.
2. For `domain`, prefer subjects listed in `entry.domain.subjects`.
3. Prefer complete prose sentences containing the word over a choices-only line.
4. Prefer a context whose year appears in `entry.englishExam.years`.
5. Break ties by newest year, then `paperId`, question number, and character offset.

Extract the containing full sentence or line verbatim, without replacing the headword with a blank. Save the source question ID and verify the emitted context is an exact substring of that question text. For the 385 supplement-only words without a raw occurrence, omit source context and mark `supplement-no-local-context`; do not invent one during the core build.

### 5. Enrich missing fields in a separate, reviewable stage

Create a generated enrichment artifact keyed by normalized headword, never edit master or cards in place during lookup. Each row should store:

- headword, returned lemma, senses/POS/Chinese, generated examples;
- model ID, prompt/schema version, generated timestamp;
- source input hashes and validation status;
- reviewer status (`pending | accepted | rejected`).

Use lexicon generation only for the 2,481 missing Chinese, 3,763 missing POS, and 385 no-context entries. Automatically validate schema, lemma/alias consistency, Traditional Chinese presence, and that examples contain the headword or an accepted inflection. Only accepted Chinese/POS can fill the trusted card. Generated examples must stay labelled `AI 例句`; they cannot satisfy the verbatim exam-context assertion.

### 6. Preserve SRS identity intentionally

Changing IDs resets existing localStorage SRS state. Before choosing new IDs, create an old-card-to-headword map and migrate resolvable states to `fc-im-master-<slug>`, merging duplicates conservatively (keep the least-mastered/earliest-due state). Do not retain low-quality IDs merely to avoid a migration.

## Required build gates

The rebuild command should default to dry-run and require `--write` for mutation. It must produce a machine-readable report and fail on any of these:

- target count is not 4,859 or differs from master metadata tier sums;
- coverage is not exactly 4,859/4,859, including per-tier 17/319/2,113/2,410;
- duplicate normalized headword, slug, ID, prompt, or output row;
- any prompt contains a cloze blank or answer-choice marker;
- invalid subject/topic ID;
- a source-labelled context is not an exact substring of the cited question;
- master-provided Chinese/POS changes during generation;
- a missing field is filled without accepted enrichment provenance;
- output is not byte-identical on a second run with the same input hashes.

Also run the existing content validator and add target-coverage/template checks to it. The current validator checks duplicate IDs and references but cannot enforce vocabulary membership or provenance.

## Safest retained set

- Retain all 480 non-IM-English runtime flashcards unchanged.
- For the trusted IM vocabulary deck, retain **no generated MCQ row as the canonical card**. Regenerate all 4,859 cards from master to guarantee both coverage and a uniform provenance contract.
- Quarantine the 80 original IM seed cards as `legacy-reviewed-practice`; they may be restored as a separate grammar/reading/practice deck only after manual review and source labelling. Do not count them toward vocabulary coverage.
- Keep the auxiliary files only as forensic fixtures until the rebuild is accepted, then stop treating them as content inputs.

## Verification artifact

All quantitative results above are reproducible with `.work/analyze-trusted-flashcard-pipeline.mjs`. It reads the committed original deck through `git show HEAD:...` and the current candidate separately, so concurrent pruning does not corrupt the baseline comparison.
