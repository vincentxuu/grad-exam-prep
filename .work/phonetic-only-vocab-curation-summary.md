# Phonetic-only vocabulary curation summary

## Scope

- Recomputed from the current 4,733 generated `im-english` flashcards.
- Selected cards whose answers contain `【意思】` and `【音標】` but lack all of `【詞性】`, `【英文解釋】`, and `【例句】`.
- The target set contains exactly 24 unique headwords.
- Only `.work` review artifacts were written; no product data was modified by this review.

## Decisions

| Decision | Count | Treatment |
| --- | ---: | --- |
| `keep` | 19 | Retain and provide reviewed Traditional Chinese, POS, and concise English definition. |
| `alias` | 2 | Merge an inflection or source-code abbreviation into an existing canonical entry. |
| `exclude` | 3 | Remove proper-name fragments whose dictionary meanings do not match their source occurrence. |
| **Total** | **24** | **24/24 covered** |

## Context corrections

- `single-cell` is the adjective “單細胞的／單一細胞層級的” in *single-cell technology*, not “單室電解槽／單電池”.
- `val` is a source-code parameter abbreviating `value`, not the amino acid valine; it aliases to `value`.
- `uber` occurs as the Uber company/brand in sharing-economy and app contexts, not the medical sense “乳房”; it is excluded as a proper-name candidate rather than retained as general vocabulary.
- `von` occurs only as part of *Von Neumann architecture*. It is excluded as a detached name fragment rather than treated as the whole architecture term.
- `san` comes from *San Salvador* and *San Francisco*, not the networking acronym SAN, so it is excluded as extraction noise.
- `hamiltonian` is defined in its graph-theory sense; `iso`, `preprocess`, `bool`, `backoff`, and `broken down` are likewise corrected to their actual exam or computing contexts.

## Retained coverage

The 19 retained entries are `broken down`, `interested in`, `worn out`, `single-cell`, `videography`, `quicksort`, `phishing`, `bool`, `iso`, `backoff`, `botnet`, `hamiltonian`, `multivalued`, `nonsingular`, `orthonormal`, `pipelining`, `preprocess`, `livelock`, and `subnet`.

Aliases are `subtrees` -> `subtree` and `val` -> `value`. Exclusions are `san`, `uber`, and `von`.

## Validation

The generator and an independent set comparison both passed:

- Recomputed targets: 24.
- Curated entries: 24, all unique.
- Missing: 0; extra: 0.
- All decisions are `keep`, `alias`, or `exclude`.
- Every `keep` has non-empty `pos`, `traditionalChinese`, and `definition`.
- Every `alias` has a canonical target present in the master vocabulary.
- Every `alias` and `exclude` has a non-empty reason.
