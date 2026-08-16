import fs from 'node:fs'

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const fail = (message) => {
  throw new Error(message)
}

const master = readJson('public/data/im-it-concept-master.json')
const lessonsRaw = readJson(process.env.IM_IT_LESSONS_PATH ?? 'public/data/im-it-lessons.json')
const cardsRaw = readJson(process.env.IM_IT_CARDS_PATH ?? 'public/data/im-it-concept-cards.json')
const sourcesRaw = readJson(
  process.env.IM_IT_SOURCES_PATH ?? 'public/data/im-it-source-registry.json'
)
const metadataRaw = readJson('public/data/im-it-question-metadata.json')
const answerReviewRaw = readJson('public/data/im-it-answer-review.json')
const questionsRaw = readJson('public/data/questions.json')
const lessons = lessonsRaw.lessons
const cards = cardsRaw.cards
const canonicalSubtopics = master.topics.flatMap((topic) =>
  topic.subtopics.map((subtopic) => subtopic.id)
)
const subtopicIds = new Set(canonicalSubtopics)
const sourceById = new Map(sourcesRaw.sources.map((source) => [source.id, source]))
const questionById = new Map(
  metadataRaw.questions.map((question) => [question.questionId, question])
)
const answerReviewById = new Map(
  answerReviewRaw.questions.map((question) => [question.questionId, question])
)
const questionTextById = new Map(questionsRaw.questions.map((question) => [question.id, question]))
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const countsBySubtopic = new Map(canonicalSubtopics.map((id) => [id, 0]))

const zeroDirectRefSubtopics = new Set([
  'im-it-arch-number-systems',
  'im-it-arch-boolean-logic',
  'im-it-arch-digital-circuits',
  'im-it-prog-pointers-memory',
  'im-it-prog-error-testing',
  'im-it-ds-complexity-analysis',
  'im-it-ds-algorithm-design',
  'im-it-ai-cnn-rnn-sequence',
  'im-it-ai-ethics-governance',
])
const unsafeOnlyDirectRefSubtopics = new Set([
  // q-pp-im-it-112-19 is classified here, but its relational-database stem does not
  // match the runtime answer review, so it cannot be used as learning evidence.
  'im-it-prog-language-runtime',
])
const noSafeDirectRefSubtopics = new Set([
  ...zeroDirectRefSubtopics,
  ...unsafeOnlyDirectRefSubtopics,
])
const blockedQuestionRefs = new Set([
  'q-pp-im-it-112-3',
  'q-pp-im-it-112-4',
  'q-pp-im-it-112-19',
  'q-pp-im-it-112-26',
])

if (canonicalSubtopics.length !== 61 || subtopicIds.size !== 61) {
  fail('Canonical IM-IT taxonomy must contain exactly 61 unique subtopics')
}
if (lessonById.size !== lessons.length) fail('Duplicate lesson IDs')
if (new Set(cards.map((card) => card.id)).size !== cards.length) fail('Duplicate card IDs')
if (sourceById.size !== sourcesRaw.sources.length) fail('Duplicate source IDs')
if (lessons.length !== 35 || cards.length !== 191 || sourcesRaw.sources.length !== 35) {
  fail('Final artifact manifest must be exactly 35 lessons, 191 cards, and 35 sources')
}

const allowedSourceTypes = new Set(['book', 'course', 'documentation', 'official-guidance'])
for (const source of sourcesRaw.sources) {
  if (source.status !== 'reviewed') fail(`Unreviewed source: ${source.id}`)
  if (!allowedSourceTypes.has(source.type)) fail(`Unsupported source type: ${source.id}`)
}

for (const subtopicId of zeroDirectRefSubtopics) {
  const directRefs = metadataRaw.questions.filter(
    (question) => question.primarySubtopicId === subtopicId
  )
  if (directRefs.length !== 0) {
    fail(`Zero-direct evidence baseline changed: ${subtopicId}`)
  }
}
const runtimeDirectRefs = metadataRaw.questions
  .filter((question) => question.primarySubtopicId === 'im-it-prog-language-runtime')
  .map((question) => question.questionId)
if (runtimeDirectRefs.length !== 1 || runtimeDirectRefs[0] !== 'q-pp-im-it-112-19') {
  fail('Language-runtime unsafe evidence baseline changed and needs re-review')
}

for (const lesson of lessons) {
  if (lesson.reviewStatus !== 'reviewed') fail(`Unreviewed lesson: ${lesson.id}`)
  if (lesson.coveredSubtopicIds.length === 0) fail(`Lesson has no coverage: ${lesson.id}`)
  if (!lesson.coveredSubtopicIds.includes(lesson.subtopicId)) {
    fail(`Primary subtopic is outside lesson coverage: ${lesson.id}`)
  }
  for (const subtopicId of lesson.coveredSubtopicIds) {
    if (!subtopicIds.has(subtopicId)) fail(`Unknown subtopic ${subtopicId} in ${lesson.id}`)
    countsBySubtopic.set(subtopicId, (countsBySubtopic.get(subtopicId) ?? 0) + 1)
  }
  if (lesson.sourceRefs.length === 0) fail(`Lesson has no sources: ${lesson.id}`)
  if (new Set(lesson.sourceRefs).size !== lesson.sourceRefs.length) {
    fail(`Lesson has duplicate source refs: ${lesson.id}`)
  }
  for (const sourceId of lesson.sourceRefs) {
    const source = sourceById.get(sourceId)
    if (!source || source.status !== 'reviewed') {
      fail(`Lesson source is missing or unreviewed: ${lesson.id} -> ${sourceId}`)
    }
  }
  if (lesson.pastPaperRefs.length < lesson.minimumPastPaperRefs) {
    fail(`Lesson lacks minimum past-paper refs: ${lesson.id}`)
  }
  if (new Set(lesson.pastPaperRefs).size !== lesson.pastPaperRefs.length) {
    fail(`Lesson has duplicate past-paper refs: ${lesson.id}`)
  }
  if (
    !Number.isInteger(lesson.minimumPastPaperRefs) ||
    lesson.minimumPastPaperRefs < 0 ||
    (lesson.pastPaperRefs.length === 0 && lesson.minimumPastPaperRefs !== 0)
  ) {
    fail(`Lesson has an invalid minimum past-paper count: ${lesson.id}`)
  }
  for (const questionId of lesson.pastPaperRefs) {
    if (blockedQuestionRefs.has(questionId)) {
      fail(`Known malformed or mismatched question used as evidence: ${lesson.id} -> ${questionId}`)
    }
    const question = questionById.get(questionId)
    const review = answerReviewById.get(questionId)
    const originalQuestion = questionTextById.get(questionId)
    if (!question) fail(`Unknown question ref: ${lesson.id} -> ${questionId}`)
    if (!lesson.coveredSubtopicIds.includes(question.primarySubtopicId)) {
      fail(`Question primary subtopic is outside lesson: ${lesson.id} -> ${questionId}`)
    }
    if (
      !question.publication.practiceEligible ||
      !question.publication.autoGradeEligible ||
      question.answerConfidence.level === 'disputed'
    ) {
      fail(`Unsafe question ref: ${lesson.id} -> ${questionId}`)
    }
    if (
      !review ||
      !['confirmed', 'corrected'].includes(review.status) ||
      !review.practiceEligible ||
      !review.autoGradeEligible
    ) {
      fail(`Question lacks an eligible independent answer review: ${lesson.id} -> ${questionId}`)
    }
    const optionLabels = new Set(
      [...(originalQuestion?.text ?? '').matchAll(/\(([A-E])\)/g)].map((match) => match[1])
    )
    if (!optionLabels.has(review.reviewedAnswer)) {
      fail(`Reviewed answer is absent from original options: ${lesson.id} -> ${questionId}`)
    }
  }
  const scenario = lesson.learningScenario
  if (
    !scenario ||
    scenario.mapping.length < 4 ||
    scenario.mapping.length > 5 ||
    scenario.examCues.length !== 4
  ) {
    fail(`Incomplete learning scenario: ${lesson.id}`)
  }
  if (
    lesson.coveredSubtopicIds.some((id) => noSafeDirectRefSubtopics.has(id)) &&
    !lesson.evidenceNote
  ) {
    fail(`Foundational lesson lacks evidence note: ${lesson.id}`)
  }
  if (lesson.pastPaperRefs.length === 0 && !lesson.evidenceNote) {
    fail(`Lesson without direct past-paper refs lacks an evidence note: ${lesson.id}`)
  }

  const directlyCoveredSubtopics = new Set(
    lesson.pastPaperRefs.map((questionId) => questionById.get(questionId)?.primarySubtopicId)
  )
  for (const subtopicId of lesson.coveredSubtopicIds) {
    if (!noSafeDirectRefSubtopics.has(subtopicId) && !directlyCoveredSubtopics.has(subtopicId)) {
      fail(
        `Non-foundational subtopic lacks a direct primary question: ${lesson.id} -> ${subtopicId}`
      )
    }
  }
}

const incompleteCoverage = [...countsBySubtopic].filter(([, count]) => count !== 1)
if (incompleteCoverage.length > 0) {
  fail(`Every subtopic must be covered exactly once: ${JSON.stringify(incompleteCoverage)}`)
}

for (const card of cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson) fail(`Card has unknown lesson: ${card.id}`)
  if (!lesson.coveredSubtopicIds.includes(card.subtopicId)) {
    fail(`Card is outside lesson coverage: ${card.id}`)
  }
  if (card.reviewStatus !== 'reviewed') fail(`Unreviewed card: ${card.id}`)
  if (card.sourceRefs.length === 0) fail(`Card has no source: ${card.id}`)
  if (new Set(card.sourceRefs).size !== card.sourceRefs.length) {
    fail(`Card has duplicate source refs: ${card.id}`)
  }
  if (new Set(card.pastPaperRefs).size !== card.pastPaperRefs.length) {
    fail(`Card has duplicate past-paper refs: ${card.id}`)
  }
  if (!card.sourceRefs.every((id) => lesson.sourceRefs.includes(id))) {
    fail(`Card source escapes lesson boundary: ${card.id}`)
  }
  if (!card.pastPaperRefs.every((id) => lesson.pastPaperRefs.includes(id))) {
    fail(`Card question escapes lesson boundary: ${card.id}`)
  }
  for (const questionId of card.pastPaperRefs) {
    if (questionById.get(questionId)?.primarySubtopicId !== card.subtopicId) {
      fail(`Card claims evidence from a different primary subtopic: ${card.id} -> ${questionId}`)
    }
  }
  if (noSafeDirectRefSubtopics.has(card.subtopicId) && card.pastPaperRefs.length > 0) {
    fail(`Foundational card must not claim a direct past-paper ref: ${card.id}`)
  }
}

for (const subtopicId of canonicalSubtopics) {
  const subtopicCards = cards.filter((card) => card.subtopicId === subtopicId)
  if (subtopicCards.length < 2) fail(`Subtopic has fewer than two cards: ${subtopicId}`)
}

const uniqueQuestions = new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs))
if (
  lessonsRaw.counts.lessons !== lessons.length ||
  lessonsRaw.counts.coveredSubtopics !== 61 ||
  lessonsRaw.counts.coveredQuestions !== uniqueQuestions.size ||
  cardsRaw.totalCards !== cards.length
) {
  fail('Artifact counts do not match merged content')
}

process.stdout.write(
  `Validated IM-IT full coverage: ${lessons.length} lessons, ${cards.length} cards, 61/61 subtopics.\n`
)
