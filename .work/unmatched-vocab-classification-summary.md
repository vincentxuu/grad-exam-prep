# Classification of the 118 ECDICT + master unmatched entries

## Outcome

All 118 target-tier entries that lack both an ECDICT definition/translation and a master Chinese translation were classified individually. Every mapping includes its master tier/source, canonical form where applicable, rationale, and up to five exact `questions.json` references.

| Category | Count | Deck action |
|---|---:|---|
| A. Real necessary vocabulary | **20** | Keep one canonical card and enrich definition/POS/translation |
| B. Inflected/possessive alias | **40** | Do not create an independent card; resolve to canonical form |
| C. Proper noun or not vocabulary | **38** | Exclude from vocabulary inventory |
| D. Malformed extraction | **20** | Exclude and add extractor regression cases |
| **Total** | **118** | |

Complete machine-readable mapping: `.work/unmatched-vocab-classification.json`.

## Category A: retain and enrich

These 20 are genuine, useful lexical or technical terms. The mapping JSON includes suggested Traditional Chinese and POS values; they should still go through the same review/enrichment gate as other missing dictionary data.

| Headword | Suggested POS | Suggested Traditional Chinese |
|---|---|---|
| `unboxer` | noun | 開箱者；製作開箱內容的創作者 |
| `season-long` | adjective | 貫穿整季的；整季持續的 |
| `waste-to-energy` | noun/adjective | 廢棄物轉能源；廢棄物能源化的 |
| `ball-and-stick` | adjective | 球棒與球類型的；球棒—球模型的 |
| `non-medical` | adjective | 非醫療的；非醫療用途的 |
| `rational choice` | noun/adjective | 理性選擇；理性選擇理論的 |
| `results-driven` | adjective | 結果導向的；以成果為驅動的 |
| `self-certification` | noun | 自我認證；自行聲明符合規範 |
| `video editing` | noun/adjective | 影片剪輯；影片編輯的 |
| `blockchain` | noun | 區塊鏈 |
| `Bitcoin` | noun | 比特幣 |
| `datapath` | noun | 資料路徑 |
| `NoSQL` | noun/adjective | NoSQL；非關聯式資料庫類型 |
| `cryptocurrency` | noun | 加密貨幣 |
| `ETag` | noun | HTTP 實體標籤；快取驗證標籤 |
| `heapify` | verb/noun | 堆積化；調整成堆積 |
| `KMP` | noun/adjective | Knuth–Morris–Pratt 字串比對演算法 |
| `metaverse` | noun | 元宇宙 |
| `rsh` | noun | 遠端殼層協定／指令 |
| `SJF` | noun/adjective | 最短工作優先排程 |

## Category B: aliases, not cards

The 40 aliases contain:

- possessives such as `women's → woman`, `author's → author`, and `government's → government`;
- proper-name possessives such as `shakespeare's → Shakespeare` and `facebook's → Facebook`;
- plural/inflected forms such as `unboxers → unboxer`, `subspaces → subspace`, and `lower-pitched → low-pitched`;
- spelling/token variants such as `shortsleeved → short-sleeved` and `trust-worthy → trustworthy`.

After canonicalization, 30 point to potentially usable common/technical canonical vocabulary and 10 point to proper names that should still be excluded. Fourteen of the usable canonical forms are already target-tier master entries; the rest should be lookup aliases without automatically expanding the required-card inventory.

## Category C: exclude non-vocabulary

This bucket includes:

- people and fictional characters: `tarjei`, `komiyama`, `obi-wan`, `rosenbloom`, `thingnes`, `sembroski`;
- brands, products, benchmarks, and places: `ozempic`, `airbnb`, `jibo`, `dgx`, `mlperf`, `bishopdale`, `grand-bornand`;
- named movements/taxa/eponyms: `photo-secession`, `asfarviridae`, `dijkstra`, `warshall`;
- code identifiers: `itemcount`, `badchar`, `newvalue`, `endl`;
- transparent phrases accidentally treated as headwords: `conventionally-grown`, `video-watching-time`, `donor-related`, `planet-sized`, `six-week-old`, and similar compounds.

These may remain visible inside their cited source passages, but they should not consume SRS vocabulary slots.

## Category D: extraction defects

The 20 malformed records reveal four concrete extractor failure modes:

1. Apostrophe splitting: `didn`, `doesn`, `couldn`, `hadn`.
2. Flattened notation or code fragments: `nlgn`, `logn`, `stdc`.
3. Incorrect MCQ distractors treated as vocabulary: `driven-results`, `driving-results`, `results-driving`, `ever-expending`, `plastic-wrapping`, `wrapped-plastic`, `wrapping-plastic`, `fdap`, `idap`, `rdap`.
4. Token boundary corruption: `champs-elys`, `th-century`, `strikes-you're-out`.

These should become regression fixtures for the master-vocab extractor. In particular, option extraction must retain answer correctness/provenance; collecting every distractor into a mandatory vocabulary tier is unsafe.

## Recommended inventory correction

Do not interpret “full coverage” as one card for every raw master token. Apply this classification before generating cards:

1. Retain and enrich the 20 category-A canonical terms.
2. Collapse category B to canonical identities, excluding proper-name canonicals.
3. Remove categories C and D from the required vocabulary inventory while keeping their audit records.
4. Recompute target counts and store the classification file/hash in the generated manifest so exclusions are explicit and reproducible.
5. Fail future builds if a new ECDICT+master-unmatched entry has no reviewed classification.

## Reproduction

- `.work/extract-unmatched-vocab-context.mjs` extracts master and raw-question evidence.
- `.work/build-unmatched-vocab-classification.mjs` validates that every unmatched entry is classified and writes the JSON mapping.
- The builder throws on any unclassified word, preventing silent fallback decisions.
