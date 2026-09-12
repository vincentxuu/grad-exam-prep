import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const draftFiles = [
  '.work/im-it-lessons-network.json',
  '.work/im-it-lessons-db.json',
  '.work/im-it-lessons-os.json',
]
const reviewFiles = [
  '.work/im-it-lessons-network-review.json',
  '.work/im-it-lessons-db-review.json',
  '.work/im-it-lessons-os-review.json',
]
const drafts = draftFiles.map(read)
const reviews = reviewFiles.map(read)
if (reviews.some((review) => !review.approved)) {
  throw new Error(`Unapproved content review: ${JSON.stringify(reviews.map((review) => review.approved))}`)
}

const lessons = drafts.flatMap((draft) => draft.lessons)
const cards = drafts.flatMap((draft) => draft.cards)
const sourceRegistry = read('public/data/im-it-source-registry.json')
const conceptMaster = read('public/data/im-it-concept-master.json')
const questionMetadata = read('public/data/im-it-question-metadata.json')
const sourceIds = new Set(sourceRegistry.sources.map((source) => source.id))
const subtopicIds = new Set(
  conceptMaster.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id)),
)
const questionById = new Map(
  questionMetadata.questions.map((question) => [question.questionId, question]),
)

const unique = (label, values) => {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`)
}
unique('lesson id', lessons.map((lesson) => lesson.id))
unique('lesson subtopic', lessons.map((lesson) => lesson.subtopicId))
unique('card id', cards.map((card) => card.id))

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const validateRefs = (item) => {
  if (!item.sourceRefs.length || item.sourceRefs.some((id) => !sourceIds.has(id))) {
    throw new Error(`${item.id} has invalid source refs`)
  }
  if (!item.pastPaperRefs.length) throw new Error(`${item.id} has no past-paper refs`)
  for (const questionId of item.pastPaperRefs) {
    const question = questionById.get(questionId)
    if (
      !question ||
      question.primarySubtopicId !== item.subtopicId ||
      !question.publication.autoGradeEligible
    ) {
      throw new Error(`${item.id} has invalid question ref ${questionId}`)
    }
  }
}

for (const lesson of lessons) {
  if (!subtopicIds.has(lesson.subtopicId)) throw new Error(`${lesson.id} has unknown subtopic`)
  if (lesson.reviewStatus !== 'reviewed') throw new Error(`${lesson.id} is not reviewed`)
  if (lesson.learningObjectives.length < 3) throw new Error(`${lesson.id} needs objectives`)
  if (lesson.sections.length < 4) throw new Error(`${lesson.id} needs sections`)
  if (lesson.workedExamples.length < 2) throw new Error(`${lesson.id} needs worked examples`)
  if (lesson.commonPitfalls.length < 3) throw new Error(`${lesson.id} needs pitfalls`)
  validateRefs(lesson)
}

for (const card of cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson || lesson.subtopicId !== card.subtopicId) {
    throw new Error(`${card.id} has invalid lesson link`)
  }
  if (card.reviewStatus !== 'reviewed') throw new Error(`${card.id} is not reviewed`)
  if (!card.front.trim() || !card.back.trim() || !card.explanation.trim()) {
    throw new Error(`${card.id} has empty content`)
  }
  validateRefs(card)
  if (card.pastPaperRefs.some((id) => !lesson.pastPaperRefs.includes(id))) {
    throw new Error(`${card.id} references a question outside its lesson`)
  }
}

const coveredQuestionIds = [...new Set(lessons.flatMap((lesson) => lesson.pastPaperRefs))]
const lessonsDocument = {
  schemaVersion: 1,
  subjectId: 'im-it',
  status: 'reviewed',
  contentPolicy:
    '本站提供依教材與考古題整理的原創摘要；不是教材轉載，也不把技術覆核答案稱為官方答案。',
  counts: {
    lessons: lessons.length,
    coveredSubtopics: lessons.length,
    coveredQuestions: coveredQuestionIds.length,
  },
  lessons: lessons.sort((a, b) => a.id.localeCompare(b.id)),
}
const cardsDocument = {
  schemaVersion: 1,
  subjectId: 'im-it',
  status: 'reviewed',
  generationPolicy: '只由 reviewed lesson 衍生，保留 sourceRefs 與 pastPaperRefs。',
  totalCards: cards.length,
  cards: cards.sort((a, b) => a.id.localeCompare(b.id)),
}

write('public/data/im-it-lessons.json', lessonsDocument)
write('public/data/im-it-concept-cards.json', cardsDocument)
console.log(JSON.stringify({ ...lessonsDocument.counts, cards: cards.length }))
