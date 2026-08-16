# MIS 106-110 PDF fidelity audit

## Scope and method

- Authority: `public/papers/pp-im-mis-{106..110}.pdf`.
- Compared target: the 20 `im-mis` records for years 106-110 in `public/data/questions.json`.
- Followed the PDF skill: rendered every PDF page to PNG with Poppler at 170 DPI and visually inspected all nine rendered pages. Tesseract OCR (`eng+chi_tra`) was used only as a navigation and token-recall aid, not as the authority.
- Checked question count and numbering, complete stems and subquestions, `subQuestions` metadata, scoring, formulas, schema/table semantics, requested drawings, whether `hasImage` is appropriate, and whether open-ended essays use the non-applicable answer marker `N/A`.
- Did not modify product data or shared JSON.

## Summary

| Year | PDF pages | Questions | Points | Result |
| --- | ---: | ---: | ---: | --- |
| 106 | 1 | 4 | 100 | Text matches; 4 records need subquestion metadata |
| 107 | 2 | 4 | 100 | Q4 loses primary-key formatting; Q2/Q4 need subquestion metadata |
| 108 | 2 | 4 | 100 | Text matches; 3 records need subquestion metadata |
| 109 | 2 | 4 | 100 | Text matches; 2 records need subquestion metadata |
| 110 | 2 | 4 | 100 | Text matches; 4 records need subquestion metadata |
| **Total** | **9** | **20** | **500** | **20/20 present; 15 question records and 15 answer markers need consistency repairs** |

All five papers contain four questions numbered 1-4 and total 100 points. The aggregate question bank agrees with those counts and totals.

## Per-paper findings

### 106 (PDF page 1)

- Q1: competitive strategies, two differentiation examples (10%) and IT strategy/management recommendation (15%) are complete; total 25.
- Q2: sharing-economy definition, challenges (12%), and an IS/IT solution (13%) are complete; total 25.
- Q3: all four OSS/GPL/Apache/strategic-advantage subquestions and scores 5+7+7+6 are complete; total 25.
- Q4: all three relational versus No-SQL subquestions and scores 11+7+7 are complete; total 25.
- No figures or tables need an image. `hasImage: false` is correct for all four records.
- All four records have explicitly numbered subquestions in the PDF and therefore need `subQuestions` metadata: Q1 `1-2`, Q2 `1-2`, Q3 `1-4`, Q4 `1-3`.

### 107 (PDF pages 1-2)

- Q1: codification versus connectivity prompt and 20% score match page 1.
- Q2: both environmental munificence/dynamism subquestions and scores 15+15 match page 1.
- Q3: software-system acquisition sources, staffing requirements, selection conditions, and 25% score match page 1.
- Q4 spans both pages and contains all schema relations and three SQL subquestions (8+9+8 = 25). The wording and relations are present, but the stored plain-text schema discarded the underlines used by the PDF to identify primary keys. This loses four material schema indicators:
  - `Book.BookId` is the primary key.
  - `Book_Copy.(BookId, CopyId)` is a composite primary key.
  - `Library_Branch.BranchId` is the primary key.
  - `Publisher.PublisherId` is the primary key.
- The replacement manifest preserves the PDF's schema semantics by marking those columns `[PK]`. This is a text repair; no raster image is necessary, so `hasImage: false` remains correct.
- Q2 and Q4 need `subQuestions` metadata (`1-2` and `1-3`, respectively). Q1 and Q3 are single, unpartitioned essay prompts.

### 108 (PDF pages 1-2)

- Q1: theories for IT increasing/decreasing firm size and conditions, 20%, matches page 1.
- Q2: data-lifecycle managerial decisions (20%) and centralized/decentralized structure (10%), total 30, match page 1.
- Q3: all four model-evaluation subquestions and scores 6+7+6+6, total 25, match page 1.
- Q4 continues onto page 2; all three fairness definitions and all five 5% subquestions are complete, total 25.
- No source figure or table is omitted. `hasImage: false` is correct.
- Q2, Q3, and Q4 need `subQuestions` metadata (`a-b`, `a-d`, and `a-e`). Q1 is an unpartitioned essay prompt.

### 109 (PDF pages 1-2)

- Q1: the Cobb-Douglas formula and definitions, plus the TPS and big-data subquestions (12+12 = 24), match page 1. The text representation `Q = A x L^α x C^β` preserves the formula's semantics, so no image is needed.
- Q2: all complementary-asset context and subquestions (9+9+8 = 26) match page 1.
- Q3: the three-sided food-delivery platform and cross-subsidy prompt, 25%, matches page 2.
- Q4: the YouBike latent-demand estimation prompt and all feasibility/acceptability constraints, 25%, matches page 2.
- `hasImage: false` is correct for all four records.
- Q1 and Q2 need `subQuestions` metadata (`a-b` and `a-c`). Q3 and Q4 are unpartitioned essay prompts.

### 110 (PDF pages 1-2)

- Q1: non-money-based to money-based sharing-platform business processes and IT strategy, 13+13 = 26, match page 1.
- Q2: digital-market information asymmetry and switching costs, 12+12 = 24, match page 1.
- Q3: all Scrum role, daily stand-up, Sprint Backlog, and Burn Down Chart subquestions and scores 7+6+6+6, total 25, match page 2. The prompt asks the examinee to provide a chart; the PDF itself does not supply one, so `hasImage: false` is correct.
- Q4: all five traffic-prediction data/system/use-case subquestions at 5% each, total 25, match page 2. The prompt asks the examinee to draw a use-case diagram; the PDF itself has no source diagram, so `hasImage: false` is correct.
- All four records need `subQuestions` metadata: Q1 `a-b`, Q2 `a-b`, Q3 `a-d`, and Q4 `a-e`.

## Replacement and answer conclusions

- Question replacements: 15 records in `.work/im-mis-106-110-replacements.json`. All 15 restore explicit `subQuestions` metadata; `q-pp-im-mis-107-4` additionally restores the primary-key annotations. The other 14 records keep their current question text unchanged.
- Answer replacements: 15 records in `.work/im-mis-106-110-answer-replacements.json`. Every question in these five papers is open-ended, so a letter answer is inapplicable. Five records already use `N/A` (`107-4`, `108-1`, `108-2`, `108-3`, and `109-1`); the manifest changes the other 15 letter markers to `N/A` while preserving each explanation verbatim.
- The Q107-4 text repair does not alter what the SQL subquestions ask, so its existing explanation remains valid.
- Minor source typos/grammar were intentionally preserved or normalized only where meaning is unchanged; no additional replacement is justified by the PDF authority.
