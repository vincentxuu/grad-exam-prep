# IM-STAT subject-specific content review

Review date: 2026-08-16

## Authority boundary

- Canonical question text comes only from `public/data/questions.json`, already repaired against the two local official PDFs.
- PDF hashes are locked in `im-stat-source-registry.json`: 114 is `bb31e0…618a34`; 115 is `07ac6f…476479`.
- The old dirty worktree supplied audit evidence only. No old aggregate artifact was copied into production data.
- Years 106–113 are explicitly `notApplicableYears`: the institute did not offer a separate statistics exam then. They are not missing-paper backlog.

## Five-question solution review

| Question | Review checks | Outcome |
| --- | --- | --- |
| 114-4 | adjusted R² formula; residual df `440-3-1`; intercept `coef/se`; joint F p-value | `0.1643`, `436`, `6.59`; reject joint-zero slopes |
| 114-5 | five-term sums `Σg=3T`, `Σg²=11T`; expectation linearity; independence | unbiased; `Var(m)=11σ²/(9T)` |
| 115-3 | enumerate six support points; total weight 12; transform each point; marginalize | `c=12`; transformed and marginal PMFs sum to 1 |
| 115-4 | weights sum to 1; differentiate both variance expressions | all unbiased; `α=1`, `β=5/3` |
| 115-5 | expected counts; six Pearson terms; df; critical-value comparison | `χ²≈6.42`, `df=2`; reject independence at 5% |

All five worked solutions are non-official, have `approvedAnswer: null`, and remain `self_review_only`. Rubrics expose `label`, `criteria[]`, and `points` for a future subject UI without changing shared code.

## Learning boundary

- Four micro-lessons are directly backed by the five questions: PMF transformation, estimators, regression dashboard, and chi-square independence.
- Two prerequisite lessons cover expectation/variance and the common hypothesis-test workflow. Their `pastPaperRefs` are empty and `evidenceNote` prevents false historical-frequency claims.
- Every lesson includes a four-row everyday mapping, an explicit analogy boundary, four exam cues, worked examples, and common pitfalls.
- The 22 concept cards remain lesson-local. Eighteen selected SRS records are only `curated_candidates` and are not written to the global deck.

## Release gates

- Deterministic builder drift check.
- Exact five-question closure and question-text SHA-256 lock.
- PDF file SHA-256 lock.
- Rubric point totals equal the official question points.
- Zero automatic grading and zero full-mock eligibility.
- Exact 106–113 not-applicable declaration.
