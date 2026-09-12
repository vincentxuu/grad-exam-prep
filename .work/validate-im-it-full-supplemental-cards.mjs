import fs from 'node:fs'

const supplementalPath = '.work/im-it-full-supplemental-cards.json'
const masterPath = 'public/data/im-it-concept-master.json'
const lessonsPath = 'public/data/im-it-lessons.json'
const canonicalCardsPath = 'public/data/im-it-concept-cards.json'
const metadataPath = 'public/data/im-it-question-metadata.json'
const reviewPath = 'public/data/im-it-answer-review.json'
const sourcesPath = 'public/data/im-it-source-registry.json'
const questionsPath = 'public/data/questions.json'
const fragmentCardPaths = ['a', 'b', 'c'].map((batch) => `.work/im-it-full-batch-${batch}-cards.json`)

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const supplemental = read(supplementalPath)
const master = read(masterPath)
const cards = supplemental.cards
const lessons = read(lessonsPath).lessons
const canonicalCards = read(canonicalCardsPath).cards
const fragmentCards = fragmentCardPaths.flatMap((path) => read(path).cards)
const metadata = read(metadataPath).questions
const answerReviews = read(reviewPath).questions
const sources = read(sourcesPath).sources
const questions = read(questionsPath).questions

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function normalizeFront(value) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-Hant')
    .replace(/[\p{P}\p{S}\s]+/gu, '')
}

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const metadataById = new Map(metadata.map((entry) => [entry.questionId, entry]))
const reviewById = new Map(answerReviews.map((entry) => [entry.questionId, entry]))
const sourceById = new Map(sources.map((source) => [source.id, source]))
const questionById = new Map(questions.map((question) => [question.id, question]))
const existingCards = [...canonicalCards, ...fragmentCards]
const canonicalSubtopics = master.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id))
const existingIds = new Set(existingCards.map((card) => card.id))
const existingFronts = new Set(existingCards.map((card) => normalizeFront(card.front)))
const expectedCounts = new Map([
  ['im-it-ds-complexity-analysis', 2],
  ['im-it-ai-foundations-search', 1],
])
const expectedLessonIds = new Map([
  ['im-it-ds-complexity-analysis', 'lesson-im-it-ds-complexity-sorting-searching-01'],
  ['im-it-ai-foundations-search', 'lesson-im-it-ai-foundations-ml-evaluation-01'],
])

assert(supplemental.schemaVersion === 1, 'schemaVersion must be 1')
assert(supplemental.subjectId === 'im-it', 'subjectId must be im-it')
assert(supplemental.status === 'reviewed-fragment', 'status must be reviewed-fragment')
assert(supplemental.totalCards === cards.length, 'totalCards does not match cards length')
assert(cards.length === 3, `expected 3 cards, received ${cards.length}`)
assert(new Set(cards.map((card) => card.id)).size === cards.length, 'supplemental card IDs are not unique')

for (const [subtopicId, expected] of expectedCounts) {
  const count = cards.filter((card) => card.subtopicId === subtopicId).length
  assert(count === expected, `${subtopicId}: expected ${expected} supplemental cards, received ${count}`)
}
assert(
  cards.every((card) => expectedCounts.has(card.subtopicId)),
  'supplemental cards contain an out-of-scope subtopic'
)

for (const card of cards) {
  assert(!existingIds.has(card.id), `${card.id}: ID collides with an existing card`)
  assert(card.reviewStatus === 'reviewed', `${card.id}: card is not reviewed`)
  assert(card.lessonId === expectedLessonIds.get(card.subtopicId), `${card.id}: unexpected parent lesson`)

  const lesson = lessonById.get(card.lessonId)
  assert(lesson, `${card.id}: parent lesson does not exist`)
  assert(lesson.reviewStatus === 'reviewed', `${card.id}: parent lesson is not reviewed`)
  assert(lesson.coveredSubtopicIds.includes(card.subtopicId), `${card.id}: parent lesson does not cover subtopic`)

  for (const field of ['front', 'back', 'explanation']) {
    assert(typeof card[field] === 'string' && card[field].trim().length > 0, `${card.id}: empty ${field}`)
  }
  const normalizedFront = normalizeFront(card.front)
  assert(!existingFronts.has(normalizedFront), `${card.id}: front duplicates an existing card`)
  existingFronts.add(normalizedFront)

  assert(card.sourceRefs.length > 0, `${card.id}: sourceRefs must not be empty`)
  assert(new Set(card.sourceRefs).size === card.sourceRefs.length, `${card.id}: duplicate sourceRefs`)
  for (const sourceId of card.sourceRefs) {
    assert(lesson.sourceRefs.includes(sourceId), `${card.id}: source absent from parent lesson: ${sourceId}`)
    assert(sourceById.get(sourceId)?.status === 'reviewed', `${card.id}: source is not reviewed: ${sourceId}`)
  }

  assert(Array.isArray(card.pastPaperRefs), `${card.id}: pastPaperRefs must be an array`)
  assert(new Set(card.pastPaperRefs).size === card.pastPaperRefs.length, `${card.id}: duplicate pastPaperRefs`)
  for (const questionId of card.pastPaperRefs) {
    const entry = metadataById.get(questionId)
    const review = reviewById.get(questionId)
    const question = questionById.get(questionId)
    assert(lesson.pastPaperRefs.includes(questionId), `${card.id}: ref absent from parent lesson: ${questionId}`)
    assert(entry?.primarySubtopicId === card.subtopicId, `${card.id}: ref is not direct-primary: ${questionId}`)
    assert(entry?.publication.practiceEligible, `${card.id}: metadata practice-ineligible ref: ${questionId}`)
    assert(entry?.publication.autoGradeEligible, `${card.id}: metadata auto-grade-ineligible ref: ${questionId}`)
    assert(review?.status === 'confirmed' || review?.status === 'corrected', `${card.id}: unresolved answer: ${questionId}`)
    assert(review?.practiceEligible, `${card.id}: review practice-ineligible ref: ${questionId}`)
    assert(review?.autoGradeEligible, `${card.id}: review auto-grade-ineligible ref: ${questionId}`)
    const optionLabels = new Set([...question.text.matchAll(/\(([A-E])\)/g)].map((match) => match[1]))
    assert(optionLabels.has(review.reviewedAnswer), `${card.id}: reviewed answer absent from options: ${questionId}`)
  }

  assert(card.pastPaperRefs.length === 0, `${card.id}: supplemental evidence manifest must remain empty`)
}

const directComplexityQuestions = metadata.filter(
  (entry) => entry.primarySubtopicId === 'im-it-ds-complexity-analysis'
)
assert(
  directComplexityQuestions.length === 0,
  'complexity-analysis now has direct-primary questions; reconsider its empty evidence manifest'
)

const allCandidateCards = [...existingCards, ...cards]
assert(new Set(canonicalSubtopics).size === 61, 'canonical taxonomy must contain 61 unique subtopics')
for (const subtopicId of canonicalSubtopics) {
  const count = allCandidateCards.filter((card) => card.subtopicId === subtopicId).length
  assert(count >= 2, `${subtopicId}: candidate closure still has fewer than 2 cards`)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      supplementalCards: cards.length,
      candidateCards: allCandidateCards.length,
      canonicalSubtopicsAtCardFloor: canonicalSubtopics.length,
      closure: Object.fromEntries(
        [...expectedCounts.keys()].map((subtopicId) => [
          subtopicId,
          allCandidateCards.filter((card) => card.subtopicId === subtopicId).length,
        ])
      ),
      reviewedSourcesOnly: true,
      unsafePastPaperRefs: 0,
    },
    null,
    2
  )
)
