# IM-MIS metadata / rubrics fragment review

## Scope and authority

- Output: `.work/im-mis-metadata-rubrics-fragment.json`.
- Product/shared data was not modified.
- Repository authority was `origin/main` at `bece5066c25093cea5489d0270302aab494de4ab`.
- Inputs were limited to `public/data/questions.json`, `public/data/answers.json`, `public/data/im-mis-stat-paper-verification.json`, `.work/im-mis-pdf-audit-106-110.md`, and `.work/im-mis-pdf-audit-111-115.md`.
- No answers or intermediate artifacts were copied from another dirty worktree.

## Output contract

- The fragment exposes exactly three loader-facing top-level keys: `metadata`, `answerReviews`, and `practiceStatus`.
- 37/37 MIS questions have canonical metadata, one primary subtopic, optional secondary tags, question-text SHA-256, and PDF audit provenance.
- All 37 are `questionType: essay` and `scoringMode: self_review`.
- The 28 questions that have explicit labels contain exactly 76 subquestion rubric structures.
- The remaining 9 questions do not have source-PDF subquestion labels. They use a question-level `wholeQuestionCriteria` instead of invented subquestions.
- Every answer review embeds UI-ready `rubricItems`: 76 source-labeled items plus 9 `whole` items for unpartitioned questions. Each records label, points, criteria, reasoning steps, reasonable alternatives, limitations, and an empty `sourceRefs` field that must be filled by later source review.
- 37/37 answer-review records preserve only provenance and explanation presence/hash; none promotes the current explanation to an official or reviewed answer.

## Safety decisions

- `N/A` means that a letter answer is not applicable. It is not a grading key.
- Existing explanations are classified as `unofficial_draft_for_self_review`, with `reviewCount: 0` and confidence `unreviewed`.
- All metadata and answer reviews set `autoGradeEligible: false` and `fullMockEligible: false`.
- Essay practice may be browse/self-review eligible, but publication blockers explicitly require reviewed sources and independent rubric review.
- Strategy and governance questions explicitly allow alternative conclusions when assumptions, mechanisms, tradeoffs, and evidence are stated.
- No rubric claims a unique model answer and no AI score or numeric pass threshold is introduced.

## Self-checks

The following checks were run against the generated fragment:

- question metadata IDs exactly equal the 37 canonical `im-mis` IDs;
- rubric question IDs and answer-review IDs have the same exact closure;
- all IDs are unique;
- explicit subquestion labels and counts exactly match `questions.json` (76 total);
- rubric point totals match the 37 canonical question totals;
- all 37 answer markers are `N/A` and all 37 explanations are present;
- all question and answer decisions remain self-review only;
- no record is auto-grade or full-mock eligible;
- all 10 paper IDs resolve to the checked-in PDF verification artifact;
- every question-text and explanation hash matches the current canonical input.

## Limitations and required next review

1. The PDFs contain questions only. The PDF audits establish fidelity, not answer correctness.
2. Rubrics are draft response structures derived from the audited prompts and existing unreviewed explanations. They have not been independently scored against student responses.
3. `sourceRefs` are intentionally empty. A reviewed MIS source registry must be created and linked before these rubrics can be called publication-ready.
4. Taxonomy confidence is `medium` because a final concept-master registry was not yet available as an external closure authority. The seven stable topic groups follow `.work/mis-learning-foundation-plan.md`; IDs must be reconciled with the final concept master before merge.
5. Case facts in 114–115, especially live commerce and Apple/Gemini, are time-sensitive and need dated case sources. The fragment does not certify those facts.
6. Nine whole-question criteria are intentionally not counted among the 76 explicit subquestion rubrics. If the product requires a uniform child-rubric array, it should support a distinct `whole` rubric type instead of fabricating source labels.

## Merge recommendation

The fragment is suitable as a conservative metadata and self-review scaffold. It is not sufficient by itself to publish model answers, automated scoring, or a full mock. Merge only after concept-master ID reconciliation, reviewed-source linkage, a second rubric review, and product validation that essay questions cannot enter the A–E grading path.
