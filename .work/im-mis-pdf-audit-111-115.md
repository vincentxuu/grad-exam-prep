# MIS 111-115 PDF audit

## Scope and method

- Authority: `public/papers/pp-im-mis-{111,112,113,114,115}.pdf`.
- Compared against the 17 `im-mis` records in `public/data/questions.json`.
- Every PDF page was rendered at 180 DPI with Poppler and visually inspected. Text extraction was not used as evidence because all five PDFs are image scans.
- Checked question count and boundary, full prompt/context, subquestions, points, figures/tables, and image flags.
- The 114 and 115 papers combine MIS with statistics. The MIS boundary is Q1-Q3 in 114 and Q1-Q2 in 115; later questions belong to `im-stats` and are outside this report.

## Result

The 17 MIS records cover every MIS question in the five PDFs, use the correct numbering, and sum to the correct MIS points for each year. One substantive transcription omission exists: 111 Q1 drops the paragraph between the portfolio matrix and part (b). No other question wording or point discrepancy was found.

There is also a systematic metadata defect: all 37 MIS records in the repository currently have an empty `subQuestions` array. Thirteen of the 17 audited records visibly contain labeled subquestions. The question replacement manifest therefore contains the one missing paragraph plus all 13 missing subquestion arrays.

The PDFs contain only open-ended questions and no answer choices. Fourteen of these 17 records currently use a letter (`A` or `B`) in `answers.json`; these are not applicable to essay questions. The answer manifest changes those answer markers to `N/A` while preserving their existing explanations. This audit cannot certify the semantic correctness of explanations because the supplied PDFs contain questions only, not official solutions.

## Per-year evidence

### 111 (2 pages, 4 questions, 100 points)

| ID | PDF page | Points | Result |
|---|---:|---:|---|
| `q-pp-im-mis-111-1` | 1-2 | 26 | **Repair needed.** Existing text omits the full paragraph beginning “Besides evaluating individual IT projects...” before part (b). Parts a/b/c are present. The benefit-risk portfolio matrix is present in the PDF; `hasImage: true` is correct and `public/images/papers/pp-im-mis-111/page-1.jpg` exists. Add `subQuestions: [a,b,c]`. |
| `q-pp-im-mis-111-2` | 2 | 24 | Wording and 12%+12% points match. Add `subQuestions: [a,b]`. |
| `q-pp-im-mis-111-3` | 2 | 25 | Full prompt and points match; no labeled subparts or image. |
| `q-pp-im-mis-111-4` | 2 | 25 | Wording and 10%+15% points match. Add `subQuestions: [a,b]`. |

### 112 (1 page, 4 questions, 100 points)

| ID | PDF page | Points | Result |
|---|---:|---:|---|
| `q-pp-im-mis-112-1` | 1 | 26 | Full wording and 8+8+10 points match. Add `subQuestions: [a,b,c]`. |
| `q-pp-im-mis-112-2` | 1 | 24 | Full case and 8+8+8 points match. The PDF visually omits a `(c)` label before “Which type of risks...”; the JSON adds the label as a harmless structural normalization. Add `subQuestions: [a,b,c]`. |
| `q-pp-im-mis-112-3` | 1 | 25 | Full AI model-maintenance prompt and points match; no labeled subparts or image. |
| `q-pp-im-mis-112-4` | 1 | 25 | Full prompt and 10+15 points match. Add `subQuestions: [a,b]`. |

### 113 (2 pages, 4 questions, 100 points)

| ID | PDF page | Points | Result |
|---|---:|---:|---|
| `q-pp-im-mis-113-1` | 1 | 22 | Full wording and 10+12 points match. Add `subQuestions: [a,b]`. |
| `q-pp-im-mis-113-2` | 1 | 28 | Full wording and 10+10+8 points match. Add `subQuestions: [a,b,c]`. |
| `q-pp-im-mis-113-3` | 1 | 32 | Full wording and 16+16 points match. Add `subQuestions: [a,b]`. |
| `q-pp-im-mis-113-4` | 2 | 18 | Full wording and 6+12 points match. Add `subQuestions: [a,b]`. |

### 114 (3 pages; MIS is Q1-Q3, 65 points)

| ID | PDF page | Points | Result |
|---|---:|---:|---|
| `q-pp-im-mis-114-1` | 1 | 20 | Full wording and 10%+10% points match. Add `subQuestions: [A,B]`. |
| `q-pp-im-mis-114-2` | 1 | 30 | Full wording and 15%+15% points match. Add `subQuestions: [A,B]`. |
| `q-pp-im-mis-114-3` | 1 | 15 | Full user-stories/use-cases prompt and points match; no subpart or image. |

PDF Q4-Q5 on pages 2-3 are statistics questions and are intentionally excluded from MIS.

### 115 (2 pages; MIS is Q1-Q2, 50 points)

| ID | PDF page | Points | Result |
|---|---:|---:|---|
| `q-pp-im-mis-115-1` | 1 | 20 | Full FOMO/AI project-failure prompt and points match; no labeled subpart or image. |
| `q-pp-im-mis-115-2` | 1 | 30 | Full Apple-Gemini case, parts A/B/C, and 10%+10%+10% points match. Add `subQuestions: [A,B,C]`. |

PDF Q3-Q5 on page 2 are statistics questions and are intentionally excluded from MIS.

## Repair manifests

- `.work/im-mis-111-115-replacements.json`: 13 question records. One includes repaired text; all 13 include corrected `subQuestions`, original points/image state, and PDF evidence pages.
- `.work/im-mis-111-115-answer-replacements.json`: 14 essay-answer marker corrections from `A`/`B` to `N/A`; existing explanations are preserved.

## Totals and integrity checks

| Year | MIS questions in PDF | JSON records | MIS points | PDF pages inspected |
|---:|---:|---:|---:|---:|
| 111 | 4 | 4 | 100 | 2/2 |
| 112 | 4 | 4 | 100 | 1/1 |
| 113 | 4 | 4 | 100 | 2/2 |
| 114 | 3 | 3 | 65 | 3/3 |
| 115 | 2 | 2 | 50 | 2/2 |
| **Total** | **17** | **17** | **415** | **10/10** |

JSON schemas of both manifests were validated with `jq`. No product or shared data file was modified by this audit.
