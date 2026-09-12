# IM-MIS subject-specific pipeline review

## Scope and authority

- Source branch: clean `origin/main` worktree.
- Question authority: 37 MIS questions from 106–115, backed by `public/data/im-mis-stat-paper-verification.json` and the checked-in PDF audit notes.
- Explicit subquestion labels: 76. Nine whole-question essays intentionally do not receive invented subquestion labels.
- Existing `answers.json` explanations were hashed and classified as non-official drafts only. Dirty-worktree replacement answers were not imported.
- No shared UI/catalog or shared question, answer, flashcard data was changed by this workstream.

## Published artifact contract

- Canonical taxonomy: 7 topics, 24 reviewed subtopics.
- Question metadata: 37 essay records, each with `topicId`, `primarySubtopicId`, PDF/hash evidence and `scoringMode: self_review`.
- Answer review: 37 records and 85 rubric items (76 explicit subquestions plus 9 whole-question rubrics).
- Rubric schema: `rubricId`, `label`, `points`, `criteria`, `reasoningSteps`, `reasonableAlternatives`, `limitations`, `sourceRefs`.
- Rubric review: every question has `rubricReview.status: reviewed`, `reviewCount: 2`, two named review passes and reviewed-source closure.
- Explanation boundary: `answerSource.reviewCount: 0` and `confidence.level: unreviewed` remain mandatory. Rubric review does not silently approve the legacy prose explanation.
- Practice status: all 37 questions are `self_review_only`; auto-grade and full-mock eligibility are both zero.
- Learning content: 7 complete lessons, 48 reviewed lesson concept cards, 10 reviewed sources.
- SRS: 48 deterministic candidates remain `publishToSrs: false`; nothing is written to `flashcards.json`.

## Source review notes

The lesson/rubric registry uses stable first-party or publisher sources: Pearson MIS, Scrum Guide 2020, NIST AI RMF, NIST Privacy Framework, Apache License 2.0, GNU GPLv3, PostgreSQL SQL documentation, IFRS Sustainability Standards, Nielsen usability heuristics and Google ML engineering guidance. Scope and usage fields prevent one source from being stretched across claims it does not support.

## Verification

- `node scripts/build-im-mis-learning-artifacts.mjs --write`
- `node scripts/validate-im-mis-learning-artifacts.mjs`
- `npm test -- --runInBand src/__tests__/im-mis-learning-artifacts.test.ts src/__tests__/im-mis-stat-source-integrity.test.ts`
- `npm run validate:content`
- `npm run check:papers`

All listed subject-specific validation and tests passed. Repository-wide typecheck was attempted but is currently blocked by a concurrent, out-of-scope `src/__tests__/im-stat-answer-review.test.ts` index-typing error.

## Release limitations

1. The new JSON artifacts are ready for a subject-specific loader, but this task intentionally does not register MIS in the shared catalog or alter UI.
2. Legacy explanation prose remains non-official and unreviewed. The reviewed deliverable is the rubric/taxonomy/source boundary used for self-review, not a claim that one model answer is uniquely correct.
3. Time-sensitive cases such as live commerce, AI project failure rates and Apple/Gemini require a dated case-source pass before public copy presents their facts as current.
4. SRS candidates are deliberately unpublished until prompt-level semantic review, scheduling-load review and shared flashcard integration occur.
5. Existing repository-wide CS flashcard taxonomy warnings are unrelated and unchanged.
