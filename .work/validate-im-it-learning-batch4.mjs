import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const drafts = [
  read('.work/im-it-lessons-batch4-trends-nosql.json'),
  read('.work/im-it-lessons-batch4-network.json'),
  read('.work/im-it-lessons-batch4-arch-os.json'),
]
const metadata = read('public/data/im-it-question-metadata.json')
const concepts = read('public/data/im-it-concept-master.json')
const registry = read('public/data/im-it-source-registry.json')
const taxonomy = read('.work/im-it-batch4-taxonomy-manifest.json')

const metadataById = new Map(metadata.questions.map((question) => [question.questionId, question]))
for (const move of taxonomy.moves) {
  const question = metadataById.get(move.questionId)
  if (!question) throw new Error(`Unknown taxonomy question ${move.questionId}`)
  question.primarySubtopicId = move.toSubtopicId
}

const lessons = drafts.flatMap((draft) => draft.lessons)
const cards = drafts.flatMap((draft) => draft.cards)
const proposedSources = drafts.flatMap((draft) => draft.proposedSourceRegistryEntries ?? [])
const sourceIds = new Set([
  ...registry.sources.map((source) => source.id),
  ...proposedSources.map((source) => source.id),
])
const subtopicIds = new Set(
  concepts.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id)),
)
const excludedQuestionIds = new Set([
  'q-pp-im-it-106-8',
  'q-pp-im-it-109-7',
  'q-pp-im-it-111-24',
  'q-pp-im-it-112-17',
  'q-pp-im-it-112-20',
  'q-pp-im-it-112-24',
  'q-pp-im-it-115-25',
])

const unique = (label, values) => {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`)
}
unique('lesson IDs', lessons.map((lesson) => lesson.id))
unique('card IDs', cards.map((card) => card.id))
unique('proposed source IDs', proposedSources.map((source) => source.id))

if (lessons.length !== 5) throw new Error(`Expected 5 lessons, got ${lessons.length}`)
if (cards.length !== 30) throw new Error(`Expected 30 cards, got ${cards.length}`)

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
for (const lesson of lessons) {
  if (lesson.reviewStatus !== 'draft') throw new Error(`${lesson.id} must remain draft`)
  if (!lesson.coveredSubtopicIds.includes(lesson.subtopicId)) {
    throw new Error(`${lesson.id} primary subtopic is not covered`)
  }
  if (lesson.coveredSubtopicIds.some((id) => !subtopicIds.has(id))) {
    throw new Error(`${lesson.id} has unknown covered subtopic`)
  }
  if (lesson.sections.length < 4 || lesson.workedExamples.length < 3) {
    throw new Error(`${lesson.id} lacks lesson depth`)
  }
  if (
    !lesson.learningScenario?.title?.trim() ||
    !lesson.learningScenario?.hook?.trim() ||
    !lesson.learningScenario?.predict?.trim() ||
    !lesson.learningScenario?.boundary?.trim() ||
    !Array.isArray(lesson.learningScenario?.mapping) ||
    lesson.learningScenario.mapping.length < 4 ||
    lesson.learningScenario.mapping.length > 5 ||
    !Array.isArray(lesson.learningScenario?.examCues) ||
    lesson.learningScenario.examCues.length !== 4
  ) {
    throw new Error(`${lesson.id} has an invalid learning scenario`)
  }
  if (new Set(lesson.pastPaperRefs).size < lesson.minimumPastPaperRefs) {
    throw new Error(`${lesson.id} is below its evidence threshold`)
  }
  if (lesson.pastPaperRefs.some((id) => excludedQuestionIds.has(id))) {
    throw new Error(`${lesson.id} includes an explicitly excluded question`)
  }
  if (lesson.sourceRefs.some((id) => !sourceIds.has(id))) {
    throw new Error(`${lesson.id} has an unknown source`)
  }
  for (const questionId of lesson.pastPaperRefs) {
    const question = metadataById.get(questionId)
    if (
      !question?.publication.autoGradeEligible ||
      !lesson.coveredSubtopicIds.includes(question.primarySubtopicId)
    ) {
      throw new Error(`${lesson.id} has invalid ref ${questionId}`)
    }
  }
  const lessonCards = cards.filter((card) => card.lessonId === lesson.id)
  if (lessonCards.length !== 6) throw new Error(`${lesson.id} must have 6 cards`)
}

for (const card of cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson) throw new Error(`${card.id} has no lesson`)
  if (!lesson.coveredSubtopicIds.includes(card.subtopicId)) {
    throw new Error(`${card.id} is outside lesson coverage`)
  }
  if (card.sourceRefs.some((id) => !lesson.sourceRefs.includes(id))) {
    throw new Error(`${card.id} uses a source outside its lesson`)
  }
  if (card.pastPaperRefs.some((id) => !lesson.pastPaperRefs.includes(id))) {
    throw new Error(`${card.id} uses a question outside its lesson`)
  }
}

const invalidSourceTypes = proposedSources.filter(
  (source) => !['book', 'course', 'documentation', 'official-guidance'].includes(source.type),
)
if (invalidSourceTypes.length) throw new Error('Invalid proposed source types')

const uniqueRefs = new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs))
if (uniqueRefs.size !== 34) throw new Error(`Expected 34 unique refs, got ${uniqueRefs.size}`)

console.log(
  JSON.stringify({
    lessons: lessons.length,
    cards: cards.length,
    uniqueRefs: uniqueRefs.size,
    coveredSubtopics: new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds)).size,
    proposedSources: proposedSources.length,
  }),
)
