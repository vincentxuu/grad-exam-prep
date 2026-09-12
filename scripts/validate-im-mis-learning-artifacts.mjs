import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'public/data', name), 'utf8'))
const concept = load('im-mis-concept-master.json')
const metadata = load('im-mis-question-metadata.json')
const reviews = load('im-mis-answer-review.json')
const practice = load('im-mis-practice-status.json')
const lessons = load('im-mis-lessons.json')
const cards = load('im-mis-concept-cards.json')
const sources = load('im-mis-source-registry.json')
const srs = load('im-mis-srs-candidates.json')
const allQuestionsRaw = load('questions.json')
const allQuestions = allQuestionsRaw.questions ?? allQuestionsRaw
const misQuestions = allQuestions.filter((q) => q.subjectId === 'im-mis')

const errors = []
const require = (condition, message) => {
  if (!condition) errors.push(message)
}
const unique = (values) => new Set(values).size === values.length
const questionIds = new Set(misQuestions.map((q) => q.id))
const topicIds = new Set(concept.topics.map((t) => t.id))
const subtopics = concept.topics.flatMap((t) => t.subtopics)
const subtopicIds = new Set(subtopics.map((s) => s.id))
const sourceIds = new Set(sources.sources.map((s) => s.id))
const lessonIds = new Set(lessons.lessons.map((l) => l.id))
const questionById = new Map(misQuestions.map((q) => [q.id, q]))
const metadataById = new Map(metadata.questions.map((q) => [q.questionId, q]))
const reviewById = new Map(reviews.questions.map((q) => [q.questionId, q]))
const independentReviewer = 'independent-technical-review-2026-08-16'
const expectedSourceRefs = {
  'im-mis-strategy-alignment-differentiation': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-investment-value': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-agility-environment': ['src-im-mis-laudon-17e'],
  'im-mis-strategy-organization-economics': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-sharing-economy': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-multisided-pricing': ['src-im-mis-laudon-17e'],
  'im-mis-platforms-digital-markets-commerce': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-knowledge-management': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-enterprise-processes': ['src-im-mis-laudon-17e'],
  'im-mis-enterprise-supply-chain': ['src-im-mis-laudon-17e'],
  'im-mis-data-ai-data-lifecycle': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-privacy-framework',
  ],
  'im-mis-data-ai-model-evaluation-fairness': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-ai-rmf',
  ],
  'im-mis-data-ai-analytics-forecasting': ['src-im-mis-laudon-17e'],
  'im-mis-data-ai-ai-operations-governance': [
    'src-im-mis-google-ml-rules',
    'src-im-mis-nist-ai-rmf',
  ],
  'im-mis-development-acquisition-estimation': ['src-im-mis-laudon-17e'],
  'im-mis-development-agile-delivery': ['src-im-mis-scrum-guide-2020'],
  'im-mis-development-testing-quality': ['src-im-mis-laudon-17e'],
  'im-mis-development-requirements-ux': ['src-im-mis-laudon-17e', 'src-im-mis-nielsen-heuristics'],
  'im-mis-data-architecture-relational-nosql': ['src-im-mis-laudon-17e'],
  'im-mis-data-architecture-sql-schema': ['src-im-mis-postgresql-sql'],
  'im-mis-data-architecture-oss-licensing': ['src-im-mis-apache-license-2', 'src-im-mis-gpl-3'],
  'im-mis-governance-privacy-security': ['src-im-mis-nist-privacy-framework'],
  'im-mis-governance-esg-accountability': ['src-im-mis-ifrs-sustainability'],
  'im-mis-governance-vendor-ai-governance': [
    'src-im-mis-nist-privacy-framework',
    'src-im-mis-nist-ai-rmf',
  ],
}
const sameSet = (left = [], right = []) =>
  left.length === right.length && left.every((value) => right.includes(value))

require(misQuestions.length === 37, `expected 37 MIS questions, got ${misQuestions.length}`)
require(metadata.questions.length === 37 &&
  unique(metadata.questions.map((q) => q.questionId)), 'metadata must contain 37 unique questions')
require(reviews.questions.length === 37 &&
  unique(
    reviews.questions.map((q) => q.questionId)
  ), 'answer review must contain 37 unique questions')
require(Object.keys(practice.questions).length === 37, 'practice status must contain 37 questions')
require(metadata.questions.reduce((n, q) => n + q.subquestions.length, 0) ===
  76, 'metadata must preserve 76 explicit subquestions')
require(concept.canonicalTopicIds.length === 7 &&
  topicIds.size === 7, 'concept master must contain 7 canonical topics')
require(unique(subtopics.map((s) => s.id)), 'subtopic IDs must be unique')
require(sources.sources.every(
  (s) =>
    s.status === 'reviewed' &&
    s.review?.reviewedBy === independentReviewer &&
    s.review?.reviewedAt === '2026-08-16'
), 'all lesson sources must have a named independent scope review')

for (const q of metadata.questions) {
  require(questionIds.has(q.questionId), `${q.questionId}: unknown source question`)
  require(topicIds.has(q.topicId), `${q.questionId}: unknown topic ${q.topicId}`)
  require(subtopicIds.has(
    q.primarySubtopicId
  ), `${q.questionId}: unknown subtopic ${q.primarySubtopicId}`)
  require(concept.topics
    .find((topic) => topic.id === q.topicId)
    ?.subtopics.some(
      (subtopic) => subtopic.id === q.primarySubtopicId
    ), `${q.questionId}: primary subtopic does not belong to topic`)
  require(q.questionType === 'essay' &&
    q.scoringMode === 'self_review', `${q.questionId}: must be essay/self_review`)
  require(q.paperId ===
    questionById.get(q.questionId)?.paperId, `${q.questionId}: paper metadata drift`)
  require(/^[a-f0-9]{64}$/.test(q.originQuestionTextSha256 ?? '') &&
    /^[a-f0-9]{64}$/.test(q.pdfEvidence?.pdfSha256 ?? '') &&
    typeof q.pdfEvidence?.auditArtifact ===
      'string', `${q.questionId}: incomplete question/PDF provenance`)
  require(q.subquestions.every(
    (subquestion) =>
      subquestion.scoringMode === 'self_review' && subquestion.autoGradeEligible === false
  ), `${q.questionId}: unsafe subquestion scoring metadata`)
  require(q.publication?.autoGradeEligible === false &&
    q.publication?.fullMockEligible === false, `${q.questionId}: unsafe publication flags`)
}
for (const q of reviews.questions) {
  require(questionIds.has(q.questionId), `${q.questionId}: unknown review question`)
  require(q.official === false &&
    q.autoGradeEligible === false, `${q.questionId}: review must be non-official/self-review`)
  const explanationApproved = q.questionId === 'q-pp-im-mis-107-4'
  require(q.answerSource?.reviewCount ===
    (explanationApproved ? 1 : 0), `${q.questionId}: unexpected explanation review count`)
  require(q.confidence?.level ===
    (explanationApproved
      ? 'medium'
      : 'unreviewed'), `${q.questionId}: explanation confidence does not match review evidence`)
  require(!explanationApproved ||
    q.answerSource?.reviewers?.includes(
      independentReviewer
    ), `${q.questionId}: approved explanation lacks named independent reviewer`)
  require(q.rubricReview?.status === 'reviewed' &&
    q.rubricReview?.reviewCount >= 1 &&
    q.rubricReview?.reviewers?.includes(
      independentReviewer
    ), `${q.questionId}: rubric needs a named independent review`)
  const expectedRefs = expectedSourceRefs[metadataById.get(q.questionId)?.primarySubtopicId]
  require(expectedRefs &&
    sameSet(
      q.rubricReview?.sourceRefs,
      expectedRefs
    ), `${q.questionId}: rubric source closure must exactly match its primary subtopic`)
  require(Array.isArray(q.rubricItems) &&
    q.rubricItems.length > 0, `${q.questionId}: missing rubricItems`)
  const metadataRubricIds =
    metadataById.get(q.questionId)?.subquestions.map((subquestion) => subquestion.rubricId) ?? []
  const reviewRubricIds = q.rubricItems.map((item) => item.rubricId)
  require(metadataRubricIds.length > 0
    ? sameSet(reviewRubricIds, metadataRubricIds)
    : q.rubricItems.length === 1 &&
        q.rubricItems[0]?.label ===
          'whole', `${q.questionId}: metadata/rubric decomposition is not closed`)
  for (const item of q.rubricItems ?? []) {
    require(typeof item.label === 'string' &&
      item.label.trim(), `${q.questionId}: rubric missing label`)
    require((typeof item.criteria === 'string' && item.criteria.trim()) ||
      (Array.isArray(item.criteria) &&
        item.criteria.length), `${q.questionId}: rubric missing criteria`)
    require(Number.isFinite(item.points) ||
      typeof item.pointRange === 'string', `${q.questionId}: rubric missing points`)
    require(Array.isArray(item.sourceRefs) &&
      item.sourceRefs.length > 0 &&
      sameSet(item.sourceRefs, expectedRefs) &&
      item.sourceRefs.every((id) =>
        sourceIds.has(id)
      ), `${q.questionId}: rubric item source closure failed`)
    require(q.questionId === 'q-pp-im-mis-107-4' ||
      !item.criteria.some((criterion) =>
        criterion.startsWith('SQL 必須')
      ), `${q.questionId}: SQL criterion leaked into a non-SQL rubric`)
    require(['q-pp-im-mis-110-3', 'q-pp-im-mis-110-4'].includes(q.questionId) ||
      !item.criteria.some((criterion) =>
        criterion.startsWith('圖表或模型需')
      ), `${q.questionId}: diagram criterion leaked into a question that does not request one`)
  }
}
for (const id of questionIds) {
  require(metadataById.has(id), `${id}: missing metadata`)
  require(reviewById.has(id), `${id}: missing answer review`)
  const status = practice.questions[id]
  require(status?.status === 'self_review_only', `${id}: practice must be self_review_only`)
  require(status?.autoGradeEligible === false, `${id}: practice auto-grade must be false`)
}

const coverage = new Map()
const lessonQuestionRefs = new Set()
for (const lesson of lessons.lessons) {
  require(lesson.reviewStatus === 'reviewed', `${lesson.id}: lesson not reviewed`)
  require(lesson.learningScenario?.mapping?.length >=
    3, `${lesson.id}: incomplete learning scenario`)
  require(lesson.sections.length >= 4 &&
    lesson.workedExamples.length >= 2, `${lesson.id}: incomplete lesson structure`)
  require(Boolean(lesson.evidenceNote), `${lesson.id}: missing non-official evidence note`)
  for (const id of lesson.coveredSubtopicIds) coverage.set(id, (coverage.get(id) ?? 0) + 1)
  for (const id of lesson.sourceRefs)
    require(sourceIds.has(id), `${lesson.id}: missing source ${id}`)
  require(sameSet(lesson.sourceRefs, [
    ...new Set(lesson.coveredSubtopicIds.flatMap((id) => expectedSourceRefs[id])),
  ]), `${lesson.id}: lesson source closure is not the union of its covered subtopics`)
  for (const id of lesson.pastPaperRefs) {
    require(questionIds.has(id), `${lesson.id}: unknown question ${id}`)
    require(lesson.coveredSubtopicIds.includes(
      metadataById.get(id)?.primarySubtopicId
    ), `${lesson.id}: question ${id} outside coverage`)
    lessonQuestionRefs.add(id)
  }
}
require(lessons.lessons.length === 7, `expected 7 lessons, got ${lessons.lessons.length}`)
require(coverage.size === subtopicIds.size &&
  [...coverage.values()].every((n) => n === 1), 'every subtopic must be covered exactly once')
require(lessonQuestionRefs.size === 37, 'lessons must cover all 37 question refs exactly as a set')

const cardCounts = new Map()
for (const card of cards.cards) {
  require(lessonIds.has(card.lessonId), `${card.id}: unknown lesson`)
  require(subtopicIds.has(card.subtopicId), `${card.id}: unknown subtopic`)
  require(sameSet(
    card.sourceRefs,
    expectedSourceRefs[card.subtopicId]
  ), `${card.id}: card source closure must exactly match its subtopic`)
  for (const id of card.sourceRefs) require(sourceIds.has(id), `${card.id}: missing source ${id}`)
  for (const id of card.pastPaperRefs) {
    require(questionIds.has(id), `${card.id}: unknown question ${id}`)
    require(metadataById.get(id)?.primarySubtopicId ===
      card.subtopicId, `${card.id}: ref ${id} subtopic mismatch`)
  }
  cardCounts.set(card.subtopicId, (cardCounts.get(card.subtopicId) ?? 0) + 1)
}
require(cards.totalCards === cards.cards.length, 'concept card count mismatch')
require([...subtopicIds].every(
  (id) => (cardCounts.get(id) ?? 0) >= 2
), 'every subtopic needs at least two cards')
require(srs.status === 'candidate' &&
  srs.candidates.every((c) => c.publishToSrs === false), 'SRS candidates must remain unpublished')
require(srs.totalCandidates === cards.totalCards, 'SRS candidate count must match concept cards')

if (errors.length) {
  console.error(`IM-MIS validation failed with ${errors.length} issue(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(
  `Validated IM-MIS pipeline: 37 questions, 76 explicit subquestions, ${lessons.lessons.length} lessons, ${cards.cards.length} cards, ${sources.sources.length} reviewed sources, 0 auto-grade items.`
)
