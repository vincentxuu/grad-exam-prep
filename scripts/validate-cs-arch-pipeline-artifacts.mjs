import crypto from 'node:crypto'
import fs from 'node:fs'

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const fail = (message) => {
  throw new Error(message)
}

const conceptMaster = readJson('public/data/cs-arch-concept-master.json')
const metadataRaw = readJson('public/data/cs-arch-question-metadata.json')
const reviewRaw = readJson('public/data/cs-arch-answer-review.json')
const sourcesRaw = readJson('public/data/cs-arch-source-registry.json')
const lessonsRaw = readJson('public/data/cs-arch-lessons.json')
const cardsRaw = readJson('public/data/cs-arch-concept-cards.json')
const questions = readJson('public/data/questions.json').questions
const subjects = readJson('public/data/subjects-cs.json')

for (const artifact of [conceptMaster, metadataRaw, reviewRaw, sourcesRaw, lessonsRaw, cardsRaw]) {
  if (artifact.subjectId !== 'cs-arch') fail('Every Pipeline artifact must use subjectId=cs-arch')
  if (artifact.status !== 'draft') fail('Pipeline slice must remain draft until independent review')
}

const subject = subjects.find((entry) => entry.id === 'cs-arch')
if (!subject?.topics.some((topic) => topic.id === 'cs-arch-pipeline')) {
  fail('Canonical cs-arch-pipeline topic is missing from subjects-cs.json')
}

if (conceptMaster.coverage !== 'partial_pipeline_slice' || conceptMaster.topics.length !== 1) {
  fail('Concept master must explicitly remain a partial Pipeline slice')
}
const topicIds = new Set(conceptMaster.topics.map((topic) => topic.id))
const subtopicIds = new Set(
  conceptMaster.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id))
)
if (!topicIds.has('cs-arch-pipeline') || subtopicIds.size !== 3) {
  fail('Pipeline concept master must contain one canonical topic and three scoped subtopics')
}

const questionById = new Map(questions.map((question) => [question.id, question]))
const metadataById = new Map(metadataRaw.questions.map((entry) => [entry.questionId, entry]))
const reviewById = new Map(reviewRaw.questions.map((entry) => [entry.questionId, entry]))
if (metadataRaw.totalQuestions !== 6 || metadataById.size !== 6 || reviewById.size !== 6) {
  fail('Pipeline candidate evidence must contain exactly six unique questions')
}

for (const metadata of metadataRaw.questions) {
  const question = questionById.get(metadata.questionId)
  const review = reviewById.get(metadata.questionId)
  if (!question || question.subjectId !== 'cs-arch')
    fail(`Unknown cs-arch question: ${metadata.questionId}`)
  if (sha256(question.text) !== metadata.originQuestionTextSha256)
    fail(`Question text drift: ${metadata.questionId}`)
  if (!topicIds.has(metadata.topicId) || !subtopicIds.has(metadata.primarySubtopicId)) {
    fail(`Broken taxonomy reference: ${metadata.questionId}`)
  }
  if (!review) fail(`Missing answer review: ${metadata.questionId}`)
  if (metadata.answerSource.official || review.official)
    fail(`Answer must be non-official: ${metadata.questionId}`)
  if (metadata.scoringMode !== 'self_review')
    fail(`Candidate must remain self-review: ${metadata.questionId}`)
  if (
    metadata.publication.practiceEligible ||
    metadata.publication.autoGradeEligible ||
    metadata.publication.fullMockEligible
  ) {
    fail(`Unapproved candidate became grading eligible: ${metadata.questionId}`)
  }
  if (review.approvedAnswer !== null || review.practiceEligible || review.autoGradeEligible) {
    fail(`Answer review accidentally approved a grading key: ${metadata.questionId}`)
  }
  if (metadata.publication.blockers.length === 0 || review.unresolvedIssues.length === 0) {
    fail(`Candidate lacks explicit blockers: ${metadata.questionId}`)
  }
}

if (reviewRaw.officialAnswerKeyAvailable || reviewRaw.autoGradeEligible !== 0) {
  fail('Draft answer review cannot claim official or auto-grade answers')
}
if (reviewById.get('q-pp-cs-arch-112-7')?.status !== 'disputed') fail('112-7 must remain disputed')
if (reviewById.get('q-pp-cs-arch-114-12')?.status !== 'disputed')
  fail('114-12 must remain disputed')
if (reviewById.get('q-pp-cs-arch-110-7')?.status !== 'self_review_only')
  fail('110-7 must remain self-review only')

const sourceIds = new Set(sourcesRaw.sources.map((source) => source.id))
for (const source of sourcesRaw.sources) {
  if (source.url) new URL(source.url)
  for (const path of source.paths ?? []) {
    if (!fs.existsSync(path)) fail(`Missing local source: ${path}`)
  }
}
for (const review of reviewRaw.questions) {
  if (!review.sourceRefs.every((id) => sourceIds.has(id)))
    fail(`Broken answer sourceRef: ${review.questionId}`)
}

if (lessonsRaw.lessons.length !== 1 || lessonsRaw.counts.coveredQuestions !== 6) {
  fail('Pipeline slice must contain one lesson covering six candidate refs')
}
const lesson = lessonsRaw.lessons[0]
if (lesson.reviewStatus !== 'draft' || lesson.publication.publishEligible)
  fail('Lesson must remain unpublished draft')
if (!lesson.sourceRefs.every((id) => sourceIds.has(id))) fail('Lesson contains unknown sourceRef')
if (!lesson.coveredSubtopicIds.every((id) => subtopicIds.has(id)))
  fail('Lesson contains unknown subtopic')
if (!lesson.pastPaperRefs.every((id) => metadataById.has(id)))
  fail('Lesson contains unreviewed question ref')
if (lesson.analogy.mapping.length < 4 || !lesson.analogy.boundary)
  fail('Lesson analogy requires mapping and boundary')

if (cardsRaw.totalCards !== 8 || cardsRaw.cards.length !== 8)
  fail('Pipeline slice must contain eight cards')
if (new Set(cardsRaw.cards.map((card) => card.id)).size !== 8) fail('Card IDs must be unique')
for (const card of cardsRaw.cards) {
  if (card.lessonId !== lesson.id || card.reviewStatus !== 'draft')
    fail(`Invalid card status: ${card.id}`)
  if (!lesson.coveredSubtopicIds.includes(card.subtopicId))
    fail(`Card outside lesson taxonomy: ${card.id}`)
  if (!card.sourceRefs.every((id) => lesson.sourceRefs.includes(id)))
    fail(`Card source outside lesson: ${card.id}`)
  if (!card.pastPaperRefs.every((id) => lesson.pastPaperRefs.includes(id)))
    fail(`Card evidence outside lesson: ${card.id}`)
}

process.stdout.write(
  'Validated cs-arch Pipeline draft: 1 lesson, 8 cards, 6 non-official candidate refs, 0 auto-grade approvals.\n'
)
