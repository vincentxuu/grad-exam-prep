# pp-im-en-106 existing repair inspection

## Conclusion

The passage repair is already committed and is present on `main`; it is not an
untracked/local-only repair. The warning in the screenshot is driven by stale
paper metadata that was not cleared when the passages were repaired.

There is one important caveat: commit `4f0ca03` restored question text for
Q21-50 but did not change the existing `answer` or `explanation` fields. The
structural claim in the warning (articles are missing) is demonstrably false,
but removing the reliability warning entirely should ideally follow a separate
answer/explanation verification against an answer key or the source paper.

## Timeline and evidence

- `e8d281c` (2026-08-13): added `contentStatus: incomplete` and the warning text
  for `pp-im-en-106`, plus a test that explicitly requires that status.
- `4f0ca03` (2026-08-16 12:52 +08): commit message explicitly says it repaired
  `pp-im-en-106` Q21-50 by consolidating cloze fragments and extracting two
  reading passages from the PDF with RapidOCR.
- `4f0ca03` changed the text of every question from Q21 through Q50. It did not
  change their `answer` or `explanation` fields.
- `4f0ca03` removed all three `pp-im-en-106` structural findings from
  `paper-integrity-baseline.json`: placeholder markers, short average length,
  and missing passages.
- `4f0ca03` did **not** touch `public/data/past-papers.json` or
  `src/__tests__/paper-content-status.test.ts`, leaving the old warning and its
  hard-coded regression expectation in place.
- `879068b` (eight minutes later, nominally a speech fix) committed the helper
  scripts `scripts/fix-en-106-passages.js` and
  `scripts/fix-reading-passages.js`. Those scripts are tracked today, not
  untracked. Since the question data was already repaired in the parent of
  `879068b`, they appear to be historical repair helpers committed after their
  output rather than an unapplied pending repair.
- HEAD and `origin/main` were both `5afd2af` during this inspection.

## Current data state

The repaired group parents are present in `public/data/questions.json`:

- Q21: `Questions 21-26...`, 723 characters
- Q27: `Questions 27-32...`, 1,240 characters
- Q33: `Questions 33-40...`, 1,310 characters
- Q41: `Questions 41-45...`, 2,546 characters
- Q46: `Questions 46-50...`, 3,097 characters

None contains a `[Passage ...]` placeholder. All five carry the range header
recognized by `findPassageParent`, so Q22-26, Q28-32, Q34-40, Q42-45, and Q47-50
can resolve their passage parent in the UI.

`node scripts/check-paper-integrity.js` currently reports 61 papers / 1,475
questions and no new issues. This checker validates structural integrity, not
the correctness of the stored answers or generated explanations.

## Why the screenshot still shows the warning

`PaperContentWarning` renders whenever `getPaperContentIssue(paperId)` returns a
paper with `contentStatus`. The marker is paper-wide, so it appears even on Q1,
although the original defect concerned Q21-50 only.

The stale source is:

- `public/data/past-papers.json`: `pp-im-en-106` still has
  `contentStatus: "incomplete"` and the pre-repair message.
- `scripts/flag-paper-content-status.js`: still includes the same stale entry;
  rerunning this script would re-add the warning.
- `src/__tests__/paper-content-status.test.ts`: still asserts that 106 is
  incomplete, so the test currently protects stale metadata.

## Production/local distinction

The screenshot itself confirms production is rendering the stale metadata.
Because both the restored passages and stale marker are committed on `main`,
this is not evidence of a production build lag or an unpushed repair. The
screenshot is Q1 and therefore cannot visually establish whether the deployed
Q21-50 payload has the passages, but the repository state explains the exact
warning shown without requiring an uncommitted/deployment difference.

## Suggested follow-up (not performed)

1. Verify Q21-50 answers against an authoritative answer key if available; at
   minimum review explanations in the context of the restored passages.
2. If verified, remove `pp-im-en-106` from `FLAGS`, clear its `contentStatus` and
   `contentIssue`, and replace/remove the hard-coded test expectation.
3. Add a consistency test that a paper passing passage-integrity checks cannot
   retain a specifically `missing passage` warning, to prevent this stale-state
   mismatch from recurring.

