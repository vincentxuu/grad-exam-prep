# pp-im-en-112 current audit

Audit date: 2026-08-16

Authority: `public/papers/pp-im-en-112.pdf` (7 scanned pages). The PDF contains no answer key, so the proposed answers below are derived from grammar, meaning, and explicit reading-passage evidence.

## Result

- `questions.json` is now the correct 112 exam. All 50 questions, all three cloze passages (Q16-30), and the full reading passage (Q46-50) are present and agree with the PDF. The reconstruction happened in commit `4f0ca03`.
- There are currently **zero exact or high-similarity question matches** between `pp-im-en-109` and `pp-im-en-112`. The old “32 questions are duplicated” warning is stale.
- `answers.json` was not synchronized when the questions were rebuilt. **All 50 explanations describe the old/wrong 109 exam content.** Even where the answer letter happens to match, its explanation must be replaced.
- Of the 50 current answer letters, **36 are wrong**. Only 14 happen to equal the proposed 112 answer letter.

## Proposed answer key

```text
1-10:  A B D A D  B C C D A
11-20: D C A B D  D A B C D
21-30: A B D D C  B B A D C
31-40: C B D C A  A D C D B
41-50: D A C A C  B A A C D
```

Compact: `ABDADBCCDA DCABDDABCD ABDDCBBADC CBDCAADCDB DACACBAACD`

## Per-question comparison

`same` means only that the stored letter coincides; the stored explanation is still for another question and must be rewritten.

| Q | PDF page | Current | Proposed | Status | Evidence |
|---:|---:|:---:|:---:|:---|:---|
| 1 | 1 | A | A | same | `ebb` = subside |
| 2 | 1 | A | B | wrong | fixed phrase `in shambles` |
| 3 | 1 | C | D | wrong | `break a diplomatic stalemate` |
| 4 | 1 | C | A | wrong | `teetering on the brink` |
| 5 | 1 | D | D | same | `travails and triumphs` |
| 6 | 1 | B | B | same | disease was `contained` |
| 7 | 1 | B | C | wrong | protocol must be `overhauled` |
| 8 | 1 | D | C | wrong | channel has `pivoted to` airing ... |
| 9 | 1 | C | D | wrong | `wage concessions` |
| 10 | 1 | A | A | same | `antipathy to` a political party |
| 11 | 1 | B | D | wrong | exacerbate corruption |
| 12 | 1 | A | C | wrong | escaped `unscathed` |
| 13 | 1-2 | A | A | same | two-dimensional, uninteresting = `insipid` |
| 14 | 2 | B | B | same | `rifts and scandals` |
| 15 | 2 | C | D | wrong | viruses `mutate` |
| 16 | 2 | C | D | wrong | first attempt was `thwarted` |
| 17 | 2 | D | A | wrong | `divert traffic away` |
| 18 | 2 | C | B | wrong | plumes were `visible` from Hilo |
| 19 | 2 | D | C | wrong | plural subject volcanoes + base verb `shoot` |
| 20 | 2 | D | D | same | standard pairing `injuries and fatalities` |
| 21 | 2 | B | A | wrong | a constant and `reassuring` figure |
| 22 | 2-3 | D | B | wrong | bank `notes` |
| 23 | 2-3 | A | D | wrong | Liz Truss was Johnson's `successor` |
| 24 | 2-3 | A | D | wrong | participial phrase `surpassing ...` |
| 25 | 2-3 | A | C | wrong | `remained fully engaged in` duties |
| 26 | 3 | D | B | wrong | little `prospect of` acceding |
| 27 | 3 | C | B | wrong | abdicated `in her father's favor` |
| 28 | 3 | C | A | wrong | `heir presumptive` |
| 29 | 3 | C | D | wrong | Marion Crawford was a `governess` |
| 30 | 3 | D | C | wrong | `visiting teachers` |
| 31 | 3 | C | C | same | correlative `neither ... nor` |
| 32 | 3 | C | B | wrong | idiomatic order `Second in size only to the Louvre` |
| 33 | 3 | D | D | same | `still very much alive` |
| 34 | 3-4 | C | C | same | fixed phrase `nothing short of miraculous` |
| 35 | 4 | A | A | same | passive reduced clause `Inspired by ...` |
| 36 | 4 | C | A | wrong | `whereas` joins the contrasting clauses |
| 37 | 4 | B | D | wrong | relative adverb: `a language where ...` |
| 38 | 4 | A | C | wrong | reduced passive clause `when seen` |
| 39 | 4 | D | D | same | `considered it worthwhile to undertake` |
| 40 | 4 | C | B | wrong | locative inversion: `At ... lies a big city` |
| 41 | 4-5 | B | D | wrong | plural `features ... were`, adverb `sharply` |
| 42 | 5 | B | A | wrong | `one of which ... the other of which` |
| 43 | 5 | A | C | wrong | reduced passive clause `known by scientists as` |
| 44 | 5 | D | A | wrong | only complete construction: `It may well be that ...` |
| 45 | 5 | C | C | same | compound adjective `long-standing` |
| 46 | 5-6 | A | B | wrong | passage explicitly enumerates ten mystery-writing elements |
| 47 | 6-7 | A | A | same | item 9 defines false clues = `red herrings` |
| 48 | 7 | C | A | wrong | `sleuth` = detective |
| 49 | 7 | D | C | wrong | passage says alibis for “any other suspects,” not everyone |
| 50 | 7 | B | D | wrong | passage explicitly calls Philip Marlowe Chandler's private detective |

Wrong-letter list:

```text
2 A->B, 3 C->D, 4 C->A, 7 B->C, 8 D->C, 9 C->D,
11 B->D, 12 A->C, 15 C->D, 16 C->D, 17 D->A, 18 C->B,
19 D->C, 21 B->A, 22 D->B, 23 A->D, 24 A->D, 25 A->C,
26 D->B, 27 C->B, 28 C->A, 29 C->D, 30 D->C, 32 C->B,
36 C->A, 37 B->D, 38 A->C, 40 C->B, 41 B->D, 42 B->A,
43 A->C, 44 D->A, 46 A->B, 48 C->A, 49 D->C, 50 B->D
```

## Confidence notes

- Q32 is **medium confidence**. B is the conventional exam answer (`Second in size only to the Louvre, ...`). D (`In size second only to ...`) can be defended in edited prose, so the item is mildly ambiguous. If the product supports per-question caveats, add one to Q32; otherwise B is the best intended answer.
- Q44 is high enough for scoring but the source sentence is stylistically awkward. A is the only grammatically complete option.
- All other proposed answers are high confidence based on ordinary collocation/grammar or direct passage evidence.

## Exact repair scope

1. Replace `answers.json` entries `q-pp-im-en-112-1` through `-50` with the proposed letters and explanations about the actual 112 questions. Do not only patch the 36 letters: all 50 explanations are stale.
2. Remove `pp-im-en-112` from `FLAGS` in `scripts/flag-paper-content-status.js`; otherwise rerunning the maintenance script restores the false warning.
3. Remove `contentStatus` and `contentIssue` from the `pp-im-en-112` record in `past-papers.json`.
4. Update `src/__tests__/paper-content-status.test.ts` so 112 is expected to be reliable (109 and 111 remain suspect until separately repaired).
5. Add a regression test that pins the 50-letter key above and asserts no normalized duplicate questions between 109 and 112.
6. No question-text reconstruction is needed. The existing qfiles are synchronized with the current complete question text.

## PDF coverage map

- p.1: Q1-13
- p.2: Q13-21, complete Passage I (Q16-20), start of Passage II (Q21-25)
- p.3: Q22-34, complete Passage III (Q26-30), start of Structure section
- p.4: Q34-41
- p.5: Q41-46, start of reading passage
- p.6: remainder of reading passage, Q46-47
- p.7: Q47-50

