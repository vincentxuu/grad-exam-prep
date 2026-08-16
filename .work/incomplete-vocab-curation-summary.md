# Incomplete vocabulary curation summary

## Scope

- Recomputed from the current 4,764 `im-english` flashcards.
- Selected a card only when its answer lacks all four markers: `【詞性】`, `【英文解釋】`, `【音標】`, and `【例句】`.
- The recomputed set contains exactly 101 unique headwords.
- This review writes only `.work` artifacts and does not modify product data.

## Decisions

| Decision | Count | Treatment |
| --- | ---: | --- |
| `keep` | 70 | Retain as a useful exam/domain entry and supply reviewed POS, Traditional Chinese meaning, and concise English definition. |
| `alias` | 10 | Merge an inflected/compositional form or notation into an existing canonical master entry. |
| `exclude` | 21 | Remove malformed distractors, tokenization artifacts, identifiers, and low-value proper names from vocabulary candidates. |
| **Total** | **101** | **101/101 covered** |

## Material corrections

Several ECDICT-derived meanings were valid in another context but wrong for the source exam/domain context. The curated `keep` values correct those senses, including:

- `gpu`: graphics processing unit / 圖形處理器, not ground power unit.
- `rsa`: the RSA public-key cryptosystem, not a country or organization abbreviation.
- `nfc`: Near Field Communication / 近場通訊, not a sports conference.
- `sql`: Structured Query Language / 結構化查詢語言.
- `bst`: binary search tree / 二元搜尋樹.
- `cnn`: convolutional neural network / 卷積神經網路.
- `no means`: “no available way or method,” matching the source construction, not the idiom “by no means.”

Other retained terms were normalized for information-management exam usage, such as `ADT`, `ALU`, `BFS`, `DFS`, `DMA`, `ERP`, `ISA`, `LDAP`, `LRU`, `SMTP`, `SSL`, `TLB`, `VPN`, `serializability`, and `virtualization`.

## Alias and exclusion rationale

- Aliases collapse forms such as `being stuck` -> `stuck`, `which affect` -> `affect`, `det` -> `determinant`, and `prob` -> `probability`.
- `knuth` aliases to the existing `kmp` entry because the source occurrence names the Knuth-Morris-Pratt algorithm rather than teaching the surname as vocabulary.
- Exclusions include malformed answer choices (`enough large`, `not means`, `regard of`), extraction artifacts (`lgn`, `com`, `sys`), local identifiers (`str`), and proper names with little independent exam value (`alex`, `revis`, `ntu`).

## Validation

The generator and an independent set comparison both passed:

- Runtime `im-english` cards: 4,764.
- Recomputed incomplete set: 101.
- Curated entries: 101, all unique.
- Missing from curation: 0.
- Extra in curation: 0.
- Every decision is one of `keep`, `alias`, or `exclude`.
- Every `keep` has non-empty `pos`, `traditionalChinese`, and `definition`.
- Every `alias` has a non-empty `canonicalWord`, and every canonical target exists in the master vocabulary.
