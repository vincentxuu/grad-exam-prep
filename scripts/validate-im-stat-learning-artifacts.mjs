import crypto from 'node:crypto'
import fs from 'node:fs'

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const fail = (message) => {
  throw new Error(message)
}

const concepts = read('public/data/im-stat-concept-master.json')
const sources = read('public/data/im-stat-source-registry.json')
const metadata = read('public/data/im-stat-question-metadata.json')
const reviews = read('public/data/im-stat-answer-review.json')
const practice = read('public/data/im-stat-practice-status.json')
const lessons = read('public/data/im-stat-lessons.json')
const cards = read('public/data/im-stat-concept-cards.json')
const srs = read('public/data/im-stat-srs-candidates.json')
const canonicalQuestions = read('public/data/questions.json').questions
const answers = read('public/data/answers.json').answers

for (const artifact of [concepts, sources, metadata, reviews, practice, lessons, cards, srs]) {
  if (artifact.subjectId !== 'im-stat') fail('Every artifact must use subjectId=im-stat')
}
for (const artifact of [concepts, sources, metadata, reviews, practice, lessons, cards]) {
  if (artifact.status !== 'reviewed') fail('Publishable IM-STAT artifact is not reviewed')
}

const expectedIds = [
  'q-pp-im-stat-114-4',
  'q-pp-im-stat-114-5',
  'q-pp-im-stat-115-3',
  'q-pp-im-stat-115-4',
  'q-pp-im-stat-115-5',
]
const questionById = new Map(canonicalQuestions.map((question) => [question.id, question]))
const actualStatQuestions = canonicalQuestions.filter(
  (question) => question.subjectId === 'im-stat'
)
if (
  JSON.stringify(actualStatQuestions.map((question) => question.id)) !== JSON.stringify(expectedIds)
) {
  fail('Canonical IM-STAT questions must be exactly the five 114–115 PDF-backed questions')
}
if (actualStatQuestions.some((question) => question.year >= 106 && question.year <= 113)) {
  fail('106–113 must not contain synthetic IM-STAT questions')
}
const expectedNotApplicable = [106, 107, 108, 109, 110, 111, 112, 113]
for (const artifact of [concepts, metadata, lessons]) {
  if (
    JSON.stringify(artifact.examScope.notApplicableYears) !== JSON.stringify(expectedNotApplicable)
  ) {
    fail('106–113 not-applicable scope is missing or changed')
  }
  if (!artifact.examScope.notApplicableReason.includes('未設獨立統計考科')) {
    fail('Not-applicable scope must explain that the exam subject did not exist')
  }
}

const sourceById = new Map(sources.sources.map((source) => [source.id, source]))
if (sourceById.size !== sources.sources.length || sources.sources.length !== 6)
  fail('Source registry mismatch')
for (const source of sources.sources) {
  if (source.status !== 'reviewed') fail(`Unreviewed source: ${source.id}`)
  if (
    !source.author ||
    !source.url ||
    !source.usage ||
    !Array.isArray(source.scope) ||
    source.scope.length === 0
  ) {
    fail(`Source is incompatible with LearningSource: ${source.id}`)
  }
  new URL(source.url)
  for (const path of source.paths ?? []) {
    if (!fs.existsSync(path)) fail(`Missing PDF source: ${path}`)
    if (source.sha256 && hash(fs.readFileSync(path)) !== source.sha256)
      fail(`PDF hash drift: ${path}`)
  }
}

const conceptIds = new Set(
  concepts.topics.flatMap((topic) => topic.subtopics.map((item) => item.id))
)
if (conceptIds.size !== 11) fail('Canonical concept set must contain 11 unique subtopics')
for (const topic of concepts.topics) {
  if (!Number.isInteger(topic.importance) || topic.learningObjectives.length < 3)
    fail(`Topic is incompatible with LearningTopic: ${topic.id}`)
  for (const subtopic of topic.subtopics) {
    if (
      subtopic.topicId !== topic.id ||
      !Array.isArray(subtopic.keywords) ||
      subtopic.keywords.length < 3
    )
      fail(`Incomplete canonical subtopic: ${subtopic.id}`)
  }
}
const metadataById = new Map(metadata.questions.map((item) => [item.questionId, item]))
const reviewById = new Map(reviews.questions.map((item) => [item.questionId, item]))
if (metadata.totalQuestions !== 5 || metadataById.size !== 5 || reviewById.size !== 5)
  fail('Question closure mismatch')
if (Object.keys(practice.questions).length !== 5) fail('Practice status closure mismatch')

for (const questionId of expectedIds) {
  const question = questionById.get(questionId)
  const item = metadataById.get(questionId)
  const review = reviewById.get(questionId)
  const status = practice.questions[questionId]
  if (!question || !item || !review || !status) fail(`Missing record: ${questionId}`)
  if (item.originQuestionTextSha256 !== hash(question.text))
    fail(`Question text drift: ${questionId}`)
  if (item.responseType !== 'open_ended' || item.gradingMode !== 'self_review')
    fail(`Unsafe response mode: ${questionId}`)
  if (
    !concepts.topics.some(
      (topic) =>
        topic.id === item.topicId &&
        topic.subtopics.some((subtopic) => subtopic.id === item.primarySubtopicId)
    )
  )
    fail(`Broken primary taxonomy: ${questionId}`)
  if (item.publication.autoGradeEligible || item.publication.fullMockEligible)
    fail(`Unsafe publication: ${questionId}`)
  if (!item.conceptIds.every((id) => conceptIds.has(id))) fail(`Unknown concept: ${questionId}`)
  if (item.rubricItems.reduce((sum, rubric) => sum + rubric.points, 0) !== question.points)
    fail(`Rubric points mismatch: ${questionId}`)
  for (const rubric of item.rubricItems) {
    if (
      !rubric.label ||
      !Array.isArray(rubric.criteria) ||
      rubric.criteria.length === 0 ||
      rubric.points <= 0
    ) {
      fail(`Incomplete UI rubric: ${questionId}/${rubric.id}`)
    }
  }
  if (
    review.official ||
    review.approvedAnswer !== null ||
    review.answerType !== 'non_official_worked_solution'
  )
    fail(`Answer provenance violation: ${questionId}`)
  if (review.reviewCount < 2 || review.status !== 'technical_reviewed')
    fail(`Insufficient review: ${questionId}`)
  if (!review.workedSolution || review.workedSolution !== answers[questionId]?.explanation)
    fail(`Worked solution drift: ${questionId}`)
  if (JSON.stringify(review.rubricItems) !== JSON.stringify(item.rubricItems))
    fail(`Rubric drift: ${questionId}`)
  if (review.autoGradeEligible || review.fullMockEligible)
    fail(`Reviewed answer became auto-graded: ${questionId}`)
  if (status.status !== 'self_review_only' || status.autoGradeEligible || !status.note)
    fail(`Practice guard mismatch: ${questionId}`)
  if (answers[questionId]?.answer !== 'N/A')
    fail(`Open-ended answer has fake choice key: ${questionId}`)
}
if (reviews.officialAnswerKeyAvailable || reviews.counts.autoGradeEligible !== 0)
  fail('Review manifest claims grading eligibility')
if (practice.counts.autoGradeEligible !== 0 || practice.counts.selfReviewOnly !== 5)
  fail('Practice counts mismatch')

const lessonById = new Map(lessons.lessons.map((item) => [item.id, item]))
if (
  lessonById.size !== 6 ||
  lessons.counts.pdfBackedMicroLessons !== 4 ||
  lessons.counts.prerequisiteLessons !== 2
)
  fail('Lesson manifest mismatch')
const lessonRefs = []
for (const lesson of lessons.lessons) {
  if (lesson.reviewStatus !== 'reviewed') fail(`Unreviewed lesson: ${lesson.id}`)
  if (
    !Number.isInteger(lesson.minimumPastPaperRefs) ||
    lesson.minimumPastPaperRefs < 0 ||
    lesson.pastPaperRefs.length < lesson.minimumPastPaperRefs
  )
    fail(`Invalid minimumPastPaperRefs: ${lesson.id}`)
  if (!lesson.coveredSubtopicIds.includes(lesson.subtopicId))
    fail(`Primary subtopic outside lesson: ${lesson.id}`)
  if (!lesson.coveredSubtopicIds.every((id) => conceptIds.has(id)))
    fail(`Unknown lesson concept: ${lesson.id}`)
  if (!lesson.sourceRefs.every((id) => sourceById.has(id)))
    fail(`Unknown lesson source: ${lesson.id}`)
  if (
    !lesson.learningScenario ||
    lesson.learningScenario.mapping.length !== 4 ||
    lesson.learningScenario.examCues.length !== 4 ||
    !lesson.learningScenario.boundary
  )
    fail(`Incomplete scenario: ${lesson.id}`)
  if (
    lesson.sections.length < 4 ||
    lesson.workedExamples.length < 2 ||
    lesson.commonPitfalls.length < 3
  )
    fail(`Incomplete lesson body: ${lesson.id}`)
  if (lesson.kind === 'prerequisite') {
    if (lesson.pastPaperRefs.length || !lesson.evidenceNote)
      fail(`Prerequisite falsely claims paper evidence: ${lesson.id}`)
  } else {
    if (lesson.kind !== 'past_paper_micro_lesson' || lesson.pastPaperRefs.length === 0)
      fail(`Micro lesson lacks evidence: ${lesson.id}`)
    lessonRefs.push(...lesson.pastPaperRefs)
  }
}
if (JSON.stringify([...new Set(lessonRefs)].sort()) !== JSON.stringify([...expectedIds].sort()))
  fail('Micro lessons do not cover all five questions exactly')

if (
  cards.totalCards !== 22 ||
  cards.cards.length !== 22 ||
  new Set(cards.cards.map((item) => item.id)).size !== 22
)
  fail('Concept card manifest mismatch')
const cardCounts = new Map([...conceptIds].map((id) => [id, 0]))
for (const card of cards.cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson || !lesson.coveredSubtopicIds.includes(card.subtopicId))
    fail(`Card outside lesson: ${card.id}`)
  if (!card.sourceRefs.every((id) => lesson.sourceRefs.includes(id)))
    fail(`Card source escapes lesson: ${card.id}`)
  if (!card.pastPaperRefs.every((id) => lesson.pastPaperRefs.includes(id)))
    fail(`Card evidence escapes lesson: ${card.id}`)
  cardCounts.set(card.subtopicId, (cardCounts.get(card.subtopicId) ?? 0) + 1)
}
if ([...cardCounts.values()].some((count) => count < 2))
  fail('Every canonical subtopic needs at least two concept cards')

const cardIds = new Set(cards.cards.map((item) => item.id))
if (!srs.publishedToGlobalDeck || srs.status !== 'curated_candidates' || srs.totalCandidates !== 18)
  fail('SRS candidates must be curated and recorded as published')
if (new Set(srs.candidates.map((item) => item.id)).size !== srs.candidates.length)
  fail('Duplicate SRS candidate IDs')
for (const candidate of srs.candidates) {
  if (!cardIds.has(candidate.conceptCardId) || candidate.status !== 'reviewed_candidate')
    fail(`Invalid SRS candidate: ${candidate.id}`)
}

process.stdout.write(
  'Validated IM-STAT: 106–113 N/A, 5 self-review questions, 6 lessons, 22 cards, 18 published SRS candidates.'
)
