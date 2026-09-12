# IM-MIS independent release review

Date: 2026-08-16
Reviewer: `independent-technical-review-2026-08-16`

## Scope

- [x] Inspect all 37 question metadata records and 76 explicit subquestions.
- [x] Inspect rubric shape, source closure, eligibility, and question-to-subtopic mapping.
- [x] Inspect all seven lessons and their reviewed-source closure.
- [x] Keep every open-ended question out of auto-grade and full mock.
- [x] Regenerate artifacts from the corrected builder.
- [x] Run focused tests, drift validation, and the IM-MIS validator.

## Findings and disposition

- The original generated `reviewCount: 2` represented two automated construction passes, not two independent reviewers. It must not be presented as human/technical review evidence.
- Topic-wide source bundles caused false closure. Examples included NoSQL rubrics citing GPL/Apache, OSS rubrics citing PostgreSQL, software acquisition citing Scrum/Nielsen, and ESG citing privacy/AI sources. Source references are now assigned per subtopic.
- Generic keyword rules injected SQL criteria into non-SQL questions (`106-2`, `111-1`) and a diagram criterion into `114-3`. The release builder now removes those false criteria.
- All 37 rubrics were independently checked for question decomposition, points, self-review safety, and source scope. They receive exactly one named independent rubric review; this does not approve the existing answer explanation.
- The existing explanations are still non-official. Most remain technically unapproved because no official key exists and several contain material overclaims or omissions. Confirmed examples include:
  - `106-4`: treats all relational databases as strict ACID/vertical-only and NoSQL as BASE/horizontal-only.
  - `108-1`: reverses an important transaction-cost condition.
  - `112-2`: asserts market risk is necessarily the dominant risk for an internal manufacturing analytics project.
  - `113-2`: omits parts (a) and (b), then gives a categorical ERP-versus-custom conclusion unsupported by the stated assumptions.
- `107-4` is the one explanation approved in this pass: all three SQL statements use the supplied keys, filters, grouping, `HAVING`, and ordering consistently. It remains non-official and self-review-only.

## Publication gate

Publication is allowed only when every rubric has a named independent review and exact per-subtopic source closure. An unreviewed explanation may be shown only as non-official self-review material and never enables auto-grading or full-mock eligibility.

## Verification

- `node scripts/build-im-mis-learning-artifacts.mjs --check`: 8 artifacts, no drift.
- `node scripts/validate-im-mis-learning-artifacts.mjs`: 37 questions, 76 subquestions, 7 lessons, 48 cards, 10 reviewed sources, 0 auto-grade.
- Focused Jest: 3 suites, 11 tests passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm validate:content`: passed with the repository's existing flashcard warnings.

## Per-question closure

`Rubric units` counts an unsplit whole-question rubric as one. Every row below is rubric-reviewed once by the named independent reviewer; the last column is a separate disposition for the existing explanation.

| Question | Primary subtopic | Rubric units | Exact reviewed source refs | Existing explanation |
|---|---|---:|---|---|
| `q-pp-im-mis-106-1` | `im-mis-strategy-alignment-differentiation` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-106-2` | `im-mis-platforms-sharing-economy` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-106-3` | `im-mis-data-architecture-oss-licensing` | 4 | `src-im-mis-apache-license-2`, `src-im-mis-gpl-3` | not approved |
| `q-pp-im-mis-106-4` | `im-mis-data-architecture-relational-nosql` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-107-1` | `im-mis-enterprise-knowledge-management` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-107-2` | `im-mis-strategy-agility-environment` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-107-3` | `im-mis-development-acquisition-estimation` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-107-4` | `im-mis-data-architecture-sql-schema` | 3 | `src-im-mis-postgresql-sql` | approved, non-official |
| `q-pp-im-mis-108-1` | `im-mis-strategy-organization-economics` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-108-2` | `im-mis-data-ai-data-lifecycle` | 2 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-privacy-framework` | not approved |
| `q-pp-im-mis-108-3` | `im-mis-data-ai-model-evaluation-fairness` | 4 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-ai-rmf` | not approved |
| `q-pp-im-mis-108-4` | `im-mis-data-ai-model-evaluation-fairness` | 5 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-ai-rmf` | not approved |
| `q-pp-im-mis-109-1` | `im-mis-strategy-organization-economics` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-109-2` | `im-mis-strategy-investment-value` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-109-3` | `im-mis-platforms-multisided-pricing` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-109-4` | `im-mis-data-ai-analytics-forecasting` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-110-1` | `im-mis-platforms-sharing-economy` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-110-2` | `im-mis-platforms-digital-markets-commerce` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-110-3` | `im-mis-development-agile-delivery` | 4 | `src-im-mis-scrum-guide-2020` | not approved |
| `q-pp-im-mis-110-4` | `im-mis-data-ai-analytics-forecasting` | 5 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-111-1` | `im-mis-strategy-investment-value` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-111-2` | `im-mis-governance-privacy-security` | 2 | `src-im-mis-nist-privacy-framework` | not approved |
| `q-pp-im-mis-111-3` | `im-mis-development-testing-quality` | 1 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-111-4` | `im-mis-development-requirements-ux` | 2 | `src-im-mis-laudon-17e`, `src-im-mis-nielsen-heuristics` | not approved |
| `q-pp-im-mis-112-1` | `im-mis-enterprise-supply-chain` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-112-2` | `im-mis-strategy-investment-value` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-112-3` | `im-mis-data-ai-ai-operations-governance` | 1 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-ai-rmf` | not approved |
| `q-pp-im-mis-112-4` | `im-mis-development-acquisition-estimation` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-113-1` | `im-mis-data-ai-analytics-forecasting` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-113-2` | `im-mis-strategy-agility-environment` | 3 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-113-3` | `im-mis-data-ai-ai-operations-governance` | 2 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-ai-rmf` | not approved |
| `q-pp-im-mis-113-4` | `im-mis-governance-esg-accountability` | 2 | `src-im-mis-ifrs-sustainability` | not approved |
| `q-pp-im-mis-114-1` | `im-mis-platforms-digital-markets-commerce` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-114-2` | `im-mis-strategy-investment-value` | 2 | `src-im-mis-laudon-17e` | not approved |
| `q-pp-im-mis-114-3` | `im-mis-development-requirements-ux` | 1 | `src-im-mis-laudon-17e`, `src-im-mis-nielsen-heuristics` | not approved |
| `q-pp-im-mis-115-1` | `im-mis-data-ai-ai-operations-governance` | 1 | `src-im-mis-google-ml-rules`, `src-im-mis-nist-ai-rmf` | not approved |
| `q-pp-im-mis-115-2` | `im-mis-governance-vendor-ai-governance` | 3 | `src-im-mis-nist-privacy-framework`, `src-im-mis-nist-ai-rmf` | not approved |
