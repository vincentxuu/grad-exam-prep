# Final IM vocabulary generation audit

## Verdict: PASS

The current `public/data/flashcards.json` exactly covers the vocabulary set produced by all three formal reviews. It also passes the strengthened back-content completeness gates.

## Coverage

| Inventory step | Count |
|---|---:|
| Master entries in required tiers | 4,859 |
| Review 1: unmatched entries | 118 |
| Review 1 retained/enriched | 23 |
| Review 1 excluded/aliased | 95 |
| Review 2: incomplete entries | 101 |
| Review 2 retained/enriched | 70 |
| Review 2 excluded/aliased | 31 |
| Review 3: phonetic-only entries | 24 |
| Review 3 retained/enriched | 19 |
| Review 3 excluded/aliased | 5 |
| Combined overrides | 112 |
| Combined exclusions | 131 |
| Expected canonical vocabulary cards | **4,728** |
| Actual IM-English vocabulary cards | **4,728** |
| Missing / extra | **0 / 0** |
| Coverage | **100%** |

The final file contains 5,208 cards: 4,728 IM-English vocabulary cards plus 480 cards from other subjects.

## Review alignment

All three review artifacts are audited directly:

- `.work/unmatched-vocab-second-opinion.json`: 23 keep, 33 alias, 62 exclude.
- `.work/incomplete-vocab-curation.json`: 70 keep, 10 alias, 21 exclude.
- `.work/phonetic-only-vocab-curation.json`: 19 keep, 2 alias, 3 exclude.

Checks passed:

- all 243 reviewed words are unique across the three review files;
- every one of the 112 keep decisions has exactly one curation override;
- none of the keep decisions appears in exclusions;
- every one of the 131 alias/exclude decisions appears in exclusions;
- no unexplained override was introduced;
- all exclusions are unique required-tier master entries with a reason and source evidence (valid question references or a reviewed context excerpt);
- accepted exclusion categories include the supplemental reviews’ `incomplete-alias` and `incomplete-exclude` values;
- remaining semantic conflicts: 0.

## Canonical identity and IDs

- 4,728 normalized canonical headwords are present exactly once.
- Duplicate canonical headwords: 0.
- Duplicate IDs across all 5,208 cards: 0.
- Missing or extra canonical cards: 0.
- ID/source-headword mismatches: 0.
- Tier mismatches against master: 0.
- Canonical display overrides such as `rational-choice → rational choice` retain their source-derived stable IDs.

## Front quality

Every IM vocabulary card satisfies `prompt === headword`. Across all 4,728 fronts:

- prompts containing newlines: 0;
- cloze underscores: 0;
- `(A)`–`(E)` or lettered-choice traces: 0;
- `choose`, `select`, `blank`, `選出`, `填空`, or `克漏字` traces: 0.

## Back completeness

Every generated back must contain:

1. a non-empty `【意思】`;
2. a non-empty `【來源】`;
3. at least one non-empty supporting field among `【詞性】`, `【英文解釋】`, or `【例句】`.

An `【音標】` by itself does not satisfy the third rule.

Result: **4,728/4,728 pass; 0 violations**.

The 70 entries retained by the incomplete-content review have a stricter requirement: both their review record and generated card must contain non-empty POS and English definition fields.

Result: **70/70 pass; 0 violations**.

The 19 entries retained by the phonetic-only review must likewise contain both POS and English definition in their review record and generated card.

Result: **19/19 pass; 0 violations**.

## Card structure

All 4,728 cards use:

- `examId: im`;
- `subjectId: im-english`;
- `topicId: im-en-vocab`;
- `kind: vocabulary`;
- an answer with the required structured markers.

Structure violations: 0.

## Reproduction

Run:

```bash
node .work/final-vocab-generation-audit.mjs
```

The script writes the full result to `.work/final-vocab-generation-audit.json` and exits non-zero on any coverage, identity, front, back, review-alignment, exclusion, or structure failure.

Current status:

```text
overallStatus: PASS
mechanicalStatus: PASS
semanticExclusionStatus: PASS
independentCoveragePercent: 100
allCardBackViolations: 0
incompleteReviewKeepViolations: 0
phoneticOnlyReviewKeepViolations: 0
```
