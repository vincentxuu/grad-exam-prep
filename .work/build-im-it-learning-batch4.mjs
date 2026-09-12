import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const draftFiles = [
  '.work/im-it-lessons-batch4-trends-nosql.json',
  '.work/im-it-lessons-batch4-network.json',
  '.work/im-it-lessons-batch4-arch-os.json',
]
const reviewFiles = [
  '.work/im-it-lessons-batch4-trends-nosql-review.json',
  '.work/im-it-lessons-batch4-network-review.json',
  '.work/im-it-lessons-batch4-arch-os-review.json',
]
const expectedIncomingIds = new Set([
  'lesson-im-it-trends-emerging-digital-applications-01',
  'lesson-im-it-data-big-data-nosql-01',
  'lesson-im-it-network-ip-routing-transport-01',
  'lesson-im-it-arch-memory-data-representation-01',
  'lesson-im-it-os-scheduling-memory-management-01',
])

const drafts = draftFiles.map(read)
const reviews = reviewFiles.map(read)
if (reviews.some((review) => !review.approved)) {
  throw new Error(`Unapproved review: ${JSON.stringify(reviews.map((review) => review.approved))}`)
}

const lessonsDocument = read('public/data/im-it-lessons.json')
const cardsDocument = read('public/data/im-it-concept-cards.json')
const incomingLessons = drafts
  .flatMap((draft) => draft.lessons)
  .map((lesson) => ({ ...lesson, reviewStatus: 'reviewed' }))
const incomingCards = drafts
  .flatMap((draft) => draft.cards)
  .map((card) => ({ ...card, reviewStatus: 'reviewed' }))

if (
  incomingLessons.length !== expectedIncomingIds.size ||
  incomingLessons.some((lesson) => !expectedIncomingIds.has(lesson.id))
) {
  throw new Error('Batch 4 lesson set does not match the approved plan')
}
if (incomingCards.length !== 30) throw new Error(`Expected 30 cards, got ${incomingCards.length}`)

const sourcesDocument = read('public/data/im-it-source-registry.json')
const sourceById = new Map(sourcesDocument.sources.map((source) => [source.id, source]))
for (const source of drafts.flatMap((draft) => draft.proposedSourceRegistryEntries ?? [])) {
  if (source.status !== 'reviewed') throw new Error(`${source.id} is not a reviewed source`)
  const existing = sourceById.get(source.id)
  if (existing && JSON.stringify(existing) !== JSON.stringify(source)) {
    throw new Error(`Conflicting source registry entry ${source.id}`)
  }
  if (!existing) {
    sourcesDocument.sources.push(source)
    sourceById.set(source.id, source)
  }
}

const migratedExistingLessons = lessonsDocument.lessons.map((lesson) => ({
  ...lesson,
  coveredSubtopicIds: lesson.coveredSubtopicIds ?? [lesson.subtopicId],
  minimumPastPaperRefs: lesson.minimumPastPaperRefs ?? 6,
}))
const incomingLessonIds = new Set(incomingLessons.map((lesson) => lesson.id))
const incomingCardIds = new Set(incomingCards.map((card) => card.id))
const lessons = [
  ...migratedExistingLessons.filter((lesson) => !incomingLessonIds.has(lesson.id)),
  ...incomingLessons,
]
const cards = [
  ...cardsDocument.cards.filter((card) => !incomingCardIds.has(card.id)),
  ...incomingCards,
]

const concepts = read('public/data/im-it-concept-master.json')
const metadata = read('public/data/im-it-question-metadata.json')
const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id))
const subtopicIds = new Set(
  concepts.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id)),
)
const questionById = new Map(metadata.questions.map((question) => [question.questionId, question]))

const unique = (label, values) => {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`)
}
const validateScenario = (lesson) => {
  const scenario = lesson.learningScenario
  if (
    !scenario ||
    !scenario.title?.trim() ||
    !scenario.hook?.trim() ||
    !scenario.predict?.trim() ||
    !scenario.boundary?.trim()
  ) {
    throw new Error(`${lesson.id} needs a complete learning scenario`)
  }
  if (!Array.isArray(scenario.mapping) || scenario.mapping.length < 4 || scenario.mapping.length > 5) {
    throw new Error(`${lesson.id} needs 4-5 scenario mappings`)
  }
  if (
    scenario.mapping.some((mapping) => !mapping.everyday?.trim() || !mapping.technical?.trim())
  ) {
    throw new Error(`${lesson.id} has an incomplete scenario mapping`)
  }
  if (!Array.isArray(scenario.examCues) || scenario.examCues.length !== 4) {
    throw new Error(`${lesson.id} needs exactly 4 exam cues`)
  }
}
unique('lesson id', lessons.map((lesson) => lesson.id))
unique('card id', cards.map((card) => card.id))

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const validateRefs = (item, coveredSubtopicIds) => {
  if (!item.sourceRefs.length || item.sourceRefs.some((id) => !sourceIds.has(id))) {
    throw new Error(`${item.id} has invalid source refs`)
  }
  if (!item.pastPaperRefs.length) throw new Error(`${item.id} has no past-paper refs`)
  for (const questionId of item.pastPaperRefs) {
    const question = questionById.get(questionId)
    if (
      !question ||
      !coveredSubtopicIds.includes(question.primarySubtopicId) ||
      !question.publication.autoGradeEligible
    ) {
      throw new Error(`${item.id} has invalid question ref ${questionId}`)
    }
  }
}

for (const lesson of lessons) {
  if (!lesson.coveredSubtopicIds?.length || !lesson.coveredSubtopicIds.includes(lesson.subtopicId)) {
    throw new Error(`${lesson.id} has invalid covered subtopics`)
  }
  if (lesson.coveredSubtopicIds.some((id) => !subtopicIds.has(id))) {
    throw new Error(`${lesson.id} has unknown covered subtopic`)
  }
  if (lesson.reviewStatus !== 'reviewed') throw new Error(`${lesson.id} is not reviewed`)
  validateScenario(lesson)
  if (lesson.learningObjectives.length < 3) throw new Error(`${lesson.id} needs objectives`)
  if (lesson.sections.length < 4) throw new Error(`${lesson.id} needs sections`)
  if (lesson.workedExamples.length < 2) throw new Error(`${lesson.id} needs worked examples`)
  if (lesson.commonPitfalls.length < 3) throw new Error(`${lesson.id} needs pitfalls`)
  if (
    !Number.isInteger(lesson.minimumPastPaperRefs) ||
    lesson.minimumPastPaperRefs < 4
  ) {
    throw new Error(`${lesson.id} has an invalid reviewed evidence threshold`)
  }
  if (new Set(lesson.pastPaperRefs).size < lesson.minimumPastPaperRefs) {
    throw new Error(
      `${lesson.id} needs at least ${lesson.minimumPastPaperRefs} unique past-paper refs`,
    )
  }
  validateRefs(lesson, lesson.coveredSubtopicIds)
}

for (const card of cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson || !lesson.coveredSubtopicIds.includes(card.subtopicId)) {
    throw new Error(`${card.id} has invalid lesson or subtopic link`)
  }
  if (card.reviewStatus !== 'reviewed') throw new Error(`${card.id} is not reviewed`)
  if (!card.front.trim() || !card.back.trim() || !card.explanation.trim()) {
    throw new Error(`${card.id} has empty content`)
  }
  validateRefs(card, lesson.coveredSubtopicIds)
  if (card.pastPaperRefs.some((id) => !lesson.pastPaperRefs.includes(id))) {
    throw new Error(`${card.id} references a question outside its lesson`)
  }
}

const coveredSubtopicIds = [
  ...new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds)),
]
const coveredQuestionIds = [...new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs))]
const outputLessons = {
  ...lessonsDocument,
  schemaVersion: 2,
  counts: {
    lessons: lessons.length,
    coveredSubtopics: coveredSubtopicIds.length,
    coveredQuestions: coveredQuestionIds.length,
  },
  lessons: lessons.sort((a, b) => a.id.localeCompare(b.id)),
}
const outputCards = {
  ...cardsDocument,
  totalCards: cards.length,
  cards: cards.sort((a, b) => a.id.localeCompare(b.id)),
}

write('public/data/im-it-lessons.json', outputLessons)
write('public/data/im-it-concept-cards.json', outputCards)
write('public/data/im-it-source-registry.json', sourcesDocument)
console.log(JSON.stringify({ ...outputLessons.counts, cards: cards.length }))
