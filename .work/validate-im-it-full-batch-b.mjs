import fs from 'node:fs'

const lessonsPath = '.work/im-it-full-batch-b-lessons.json'
const cardsPath = '.work/im-it-full-batch-b-cards.json'
const metadataPath = 'public/data/im-it-question-metadata.json'
const reviewPath = 'public/data/im-it-answer-review.json'
const sourcesPath = 'public/data/im-it-source-registry.json'
const questionsPath = 'public/data/questions.json'

const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8')).lessons
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8')).cards
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).questions
const answerReviews = JSON.parse(fs.readFileSync(reviewPath, 'utf8')).questions
const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8')).sources
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8')).questions

const targets = new Set([
  'im-it-ds-linear-structures',
  'im-it-ds-hashing',
  'im-it-ds-graphs',
  'im-it-ds-algorithm-design',
  'im-it-db-er-modeling',
  'im-it-db-normalization',
  'im-it-db-storage-indexing',
  'im-it-os-synchronization',
  'im-it-os-deadlocks',
])

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertUnique(items, label) {
  assert(new Set(items).size === items.length, `${label} contains duplicate IDs`)
}

const metadataById = new Map(metadata.map((entry) => [entry.questionId, entry]))
const reviewById = new Map(answerReviews.map((entry) => [entry.questionId, entry]))
const sourcesById = new Map(sources.map((entry) => [entry.id, entry]))
const questionsById = new Map(questions.map((entry) => [entry.id, entry]))
const expectedCardRefs = new Map(
  Object.entries({
    'card-im-it-ds-linear-stack-lifo-b01': ['q-pp-im-it-115-4'],
    'card-im-it-ds-linear-adt-choice-b02': [],
    'card-im-it-ds-hashing-average-b01': ['q-pp-im-it-115-1'],
    'card-im-it-ds-hashing-collision-b02': [],
    'card-im-it-ds-graphs-topological-b01': ['q-pp-im-it-115-6'],
    'card-im-it-ds-graphs-mst-b02': [],
    'card-im-it-ds-design-strategies-b01': [],
    'card-im-it-ds-design-correctness-b02': [],
    'card-im-it-db-er-symbols-b01': ['q-pp-im-it-111-21', 'q-pp-im-it-114-16'],
    'card-im-it-db-er-many-to-many-b02': [],
    'card-im-it-db-normalization-forms-b01': ['q-pp-im-it-111-14', 'q-pp-im-it-114-13'],
    'card-im-it-db-normalization-fd-b02': ['q-pp-im-it-111-14', 'q-pp-im-it-114-13'],
    'card-im-it-db-indexing-bplus-b01': ['q-pp-im-it-115-16'],
    'card-im-it-db-indexing-hash-range-b02': ['q-pp-im-it-115-18'],
    'card-im-it-os-sync-race-b01': [],
    'card-im-it-os-sync-semaphore-b02': [],
    'card-im-it-os-deadlock-coffman-b01': [],
    'card-im-it-os-deadlock-banker-b02': ['q-pp-im-it-114-8'],
  })
)

assert(lessons.length === 5, `expected 5 lessons, received ${lessons.length}`)
assert(cards.length === 18, `expected 18 cards, received ${cards.length}`)
assertUnique(
  lessons.map((lesson) => lesson.id),
  'lessons'
)
assertUnique(
  cards.map((card) => card.id),
  'cards'
)

const covered = new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds))
assert(
  targets.size === covered.size && [...targets].every((target) => covered.has(target)),
  'lesson coverage does not exactly match Batch B targets'
)

for (const lesson of lessons) {
  assert(lesson.learningObjectives.length >= 4, `${lesson.id}: requires >=4 objectives`)
  assert(lesson.sections.length >= 4, `${lesson.id}: requires >=4 sections`)
  assert(lesson.workedExamples.length >= 2, `${lesson.id}: requires >=2 worked examples`)
  assert(lesson.commonPitfalls.length >= 4, `${lesson.id}: requires >=4 pitfalls`)
  assert(
    lesson.learningScenario.mapping.length >= 4 && lesson.learningScenario.mapping.length <= 5,
    `${lesson.id}: scenario mapping must contain 4-5 entries`
  )
  assert(lesson.learningScenario.examCues.length >= 4, `${lesson.id}: requires >=4 exam cues`)
  for (const field of ['hook', 'predict', 'boundary']) {
    assert(lesson.learningScenario[field]?.length >= 30, `${lesson.id}: incomplete ${field}`)
  }
  assert(
    lesson.pastPaperRefs.length === lesson.minimumPastPaperRefs,
    `${lesson.id}: minimumPastPaperRefs does not match verified refs`
  )

  for (const sourceId of lesson.sourceRefs) {
    assert(sourcesById.get(sourceId)?.status === 'reviewed', `${lesson.id}: unreviewed ${sourceId}`)
  }
  for (const questionId of lesson.pastPaperRefs) {
    const entry = metadataById.get(questionId)
    const review = reviewById.get(questionId)
    const question = questionsById.get(questionId)
    assert(entry?.publication.practiceEligible, `${lesson.id}: ineligible ref ${questionId}`)
    assert(entry?.publication.autoGradeEligible, `${lesson.id}: non-auto-grade ref ${questionId}`)
    assert(
      lesson.coveredSubtopicIds.includes(entry?.primarySubtopicId),
      `${lesson.id}: ref primary subtopic outside coverage ${questionId}`
    )
    assert(
      review?.status === 'confirmed' || review?.status === 'corrected',
      `${lesson.id}: unresolved answer review ${questionId}`
    )
    assert(review?.practiceEligible && review?.autoGradeEligible, `${lesson.id}: review-ineligible ${questionId}`)
    const optionLabels = new Set([...question.text.matchAll(/\(([A-E])\)/g)].map((match) => match[1]))
    assert(optionLabels.has(review.reviewedAnswer), `${lesson.id}: answer absent from options ${questionId}`)
  }
}

const algorithmLesson = lessons.find((lesson) =>
  lesson.coveredSubtopicIds.includes('im-it-ds-algorithm-design')
)
assert(algorithmLesson?.evidenceNote.includes('沒有 direct primary'), 'algorithm evidence note missing')
assert(algorithmLesson?.minimumPastPaperRefs === 1, 'sparse graph evidence minimum must remain 1')
assert(algorithmLesson?.evidenceNote.includes('只有 1 題'), 'sparse graph evidence disclosure missing')
assert(!algorithmLesson?.pastPaperRefs.includes('q-pp-im-it-112-26'), 'broken 112-26 must stay excluded')
assert(
  metadata.filter((entry) => entry.primarySubtopicId === 'im-it-ds-algorithm-design').length === 0,
  'algorithm design unexpectedly has direct primary refs; evidence note must be revisited'
)

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
for (const card of cards) {
  assert(targets.has(card.subtopicId), `${card.id}: outside Batch B scope`)
  const lesson = lessonById.get(card.lessonId)
  assert(lesson, `${card.id}: missing lesson ${card.lessonId}`)
  assert(lesson.coveredSubtopicIds.includes(card.subtopicId), `${card.id}: lesson does not cover subtopic`)
  assert(card.front.length >= 12 && card.back.length >= 20, `${card.id}: card content too short`)
  for (const sourceId of card.sourceRefs) {
    assert(sourcesById.get(sourceId)?.status === 'reviewed', `${card.id}: unreviewed ${sourceId}`)
    assert(lesson.sourceRefs.includes(sourceId), `${card.id}: source absent from parent lesson`)
  }
  for (const questionId of card.pastPaperRefs) {
    const entry = metadataById.get(questionId)
    const review = reviewById.get(questionId)
    assert(entry?.publication.practiceEligible && entry?.publication.autoGradeEligible, `${card.id}: ineligible ref`)
    assert(review?.practiceEligible && review?.autoGradeEligible, `${card.id}: review-ineligible ref`)
    assert(lesson.pastPaperRefs.includes(questionId), `${card.id}: ref absent from parent lesson`)
    assert(entry?.primarySubtopicId === card.subtopicId, `${card.id}: direct ref primary mismatch`)
  }
  assert(
    JSON.stringify(card.pastPaperRefs) === JSON.stringify(expectedCardRefs.get(card.id)),
    `${card.id}: direct evidence manifest drift`
  )
}

for (const target of targets) {
  const count = cards.filter((card) => card.subtopicId === target).length
  assert(count >= 2, `${target}: expected >=2 cards, received ${count}`)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      lessons: lessons.length,
      cards: cards.length,
      coveredSubtopics: covered.size,
      reviewedSourcesOnly: true,
      eligiblePastPaperRefsOnly: true,
    },
    null,
    2
  )
)
