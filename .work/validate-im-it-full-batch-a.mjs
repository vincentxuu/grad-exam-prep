import { readFileSync } from 'node:fs'

const work = new URL('./', import.meta.url)
const data = new URL('../public/data/', import.meta.url)
const read = (url, name) => JSON.parse(readFileSync(new URL(name, url), 'utf8'))

const lessons = read(work, 'im-it-full-batch-a-lessons.json').lessons
const cards = read(work, 'im-it-full-batch-a-cards.json').cards
const sourceFragment = read(work, 'im-it-full-batch-a-sources.json').sources
const metadata = read(data, 'im-it-question-metadata.json').questions
const answerReviews = read(data, 'im-it-answer-review.json').questions
const questions = read(data, 'questions.json').questions
const registrySources = read(data, 'im-it-source-registry.json').sources

const targets = [
  'im-it-arch-number-systems',
  'im-it-arch-boolean-logic',
  'im-it-arch-digital-circuits',
  'im-it-arch-io-performance',
  'im-it-prog-syntax-types-control',
  'im-it-prog-functions-scope',
  'im-it-prog-pointers-memory',
  'im-it-prog-language-runtime',
  'im-it-prog-error-testing',
  'im-it-prog-software-lifecycle',
]

const zeroDirect = new Set([
  'im-it-arch-number-systems',
  'im-it-arch-boolean-logic',
  'im-it-arch-digital-circuits',
  'im-it-prog-pointers-memory',
  'im-it-prog-error-testing',
])
const unsafeQuestionIds = new Set([
  'q-pp-im-it-112-3',
  'q-pp-im-it-112-4',
  'q-pp-im-it-112-19',
])
const allowedSourcesBySubtopic = {
  'im-it-arch-number-systems': ['src-brookshear-13e'],
  'im-it-arch-boolean-logic': ['src-brookshear-13e'],
  'im-it-arch-digital-circuits': ['src-brookshear-13e'],
  'im-it-arch-io-performance': ['src-brookshear-13e'],
  'im-it-prog-syntax-types-control': ['src-oracle-java-language-basics'],
  'im-it-prog-functions-scope': ['src-cpp-core-guidelines'],
  'im-it-prog-pointers-memory': ['src-cpp-core-guidelines'],
  'im-it-prog-language-runtime': ['src-gcc-overall-options'],
  'im-it-prog-error-testing': ['src-cpp-core-guidelines', 'src-nist-ssdf-800-218'],
  'im-it-prog-software-lifecycle': ['src-nist-ssdf-800-218'],
}

const metadataById = new Map(metadata.map((entry) => [entry.questionId, entry]))
const reviewsById = new Map(answerReviews.map((entry) => [entry.questionId, entry]))
const questionsById = new Map(questions.map((entry) => [entry.id, entry]))
const allSources = [...registrySources, ...sourceFragment]
const sourcesById = new Map(allSources.map((entry) => [entry.id, entry]))
const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const errors = []
const require = (condition, message) => {
  if (!condition) errors.push(message)
}

function answerAppearsInQuestion(questionId) {
  const text = questionsById.get(questionId)?.text ?? ''
  const answer = reviewsById.get(questionId)?.reviewedAnswer?.toUpperCase()
  if (!answer || !/^[A-E]$/.test(answer)) return false
  const optionLabels = new Set([...text.matchAll(/(?:\(|\[)([A-E])(?:\)|\])/gi)].map((match) => match[1].toUpperCase()))
  return optionLabels.has(answer)
}

function validateQuestionRef(ref, owner, expectedSubtopics) {
  const metadataEntry = metadataById.get(ref)
  const review = reviewsById.get(ref)
  require(!unsafeQuestionIds.has(ref), `${owner}: banned semantic-mismatch ref ${ref}`)
  require(metadataEntry?.publication.practiceEligible, `${owner}: not practice eligible ${ref}`)
  require(metadataEntry?.publication.autoGradeEligible, `${owner}: not auto-grade eligible ${ref}`)
  require(review?.practiceEligible && review?.autoGradeEligible, `${owner}: answer review ineligible ${ref}`)
  require(answerAppearsInQuestion(ref), `${owner}: reviewed answer absent from current options ${ref}`)
  require(
    expectedSubtopics.includes(metadataEntry?.primarySubtopicId),
    `${owner}: primary subtopic mismatch ${ref} -> ${metadataEntry?.primarySubtopicId}`
  )
}

const covered = new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds))
for (const target of targets) {
  require(covered.has(target), `missing target coverage: ${target}`)
  require(cards.filter((card) => card.subtopicId === target).length >= 2, `fewer than two cards: ${target}`)
}
require(covered.size === targets.length, `unexpected covered subtopics: ${covered.size}`)
require(new Set(lessons.map((lesson) => lesson.id)).size === lessons.length, 'duplicate lesson id')
require(new Set(cards.map((card) => card.id)).size === cards.length, 'duplicate card id')

for (const source of sourceFragment) {
  require(source.status === 'reviewed', `fragment source is not reviewed: ${source.id}`)
  require(
    ['documentation', 'official-guidance'].includes(source.type),
    `fragment source has unsupported LearningSource.type: ${source.id} -> ${source.type}`
  )
  require(source.scopeBoundary?.length > 50, `fragment source lacks scope boundary: ${source.id}`)
}

for (const lesson of lessons) {
  require(lesson.learningScenario?.hook?.length > 40, `${lesson.id}: hook incomplete`)
  require(lesson.learningScenario?.predict?.length > 20, `${lesson.id}: predict incomplete`)
  require([4, 5].includes(lesson.learningScenario?.mapping?.length), `${lesson.id}: mapping must contain 4-5 items`)
  require(lesson.learningScenario?.boundary?.length > 40, `${lesson.id}: boundary incomplete`)
  require(lesson.learningScenario?.examCues?.length === 4, `${lesson.id}: examCues must contain exactly four items`)
  require(lesson.sections?.length >= 4, `${lesson.id}: fewer than four sections`)
  require(lesson.workedExamples?.length >= 2, `${lesson.id}: fewer than two examples`)
  require(lesson.commonPitfalls?.length >= 4, `${lesson.id}: fewer than four pitfalls`)
  require(lesson.minimumPastPaperRefs === lesson.pastPaperRefs.length, `${lesson.id}: minimumPastPaperRefs mismatch`)

  for (const ref of lesson.pastPaperRefs) {
    validateQuestionRef(ref, lesson.id, lesson.coveredSubtopicIds)
  }
  const allowedSources = new Set(lesson.coveredSubtopicIds.flatMap((id) => allowedSourcesBySubtopic[id]))
  for (const sourceId of lesson.sourceRefs) {
    require(sourcesById.get(sourceId)?.status === 'reviewed', `${lesson.id}: unclosed source ${sourceId}`)
    require(allowedSources.has(sourceId), `${lesson.id}: source scope exceeds covered subtopics ${sourceId}`)
  }
  if (lesson.coveredSubtopicIds.some((id) => zeroDirect.has(id))) {
    require(lesson.evidenceNote?.includes('0 題 direct primary refs'), `${lesson.id}: missing zero-direct evidence note`)
  }
}

const logicLesson = lessonsById.get('lesson-im-it-arch-logic-circuits-01')
require(logicLesson?.minimumPastPaperRefs === 0, 'logic lesson must have minimumPastPaperRefs=0')
require(logicLesson?.pastPaperRefs.length === 0, 'logic lesson must not use adjacent paper refs')

const runtimeLesson = lessonsById.get('lesson-im-it-prog-runtime-quality-lifecycle-01')
require(
  JSON.stringify(runtimeLesson?.pastPaperRefs) === JSON.stringify(['q-pp-im-it-106-23', 'q-pp-im-it-110-10']),
  'runtime-quality lesson must retain only the two safe software-lifecycle refs'
)
require(runtimeLesson?.evidenceNote.includes('不把 UML 內容歸因於 NIST SSDF'), 'runtime evidence boundary missing')

for (const card of cards) {
  const lesson = lessonsById.get(card.lessonId)
  require(lesson, `${card.id}: unknown lesson`)
  require(targets.includes(card.subtopicId), `${card.id}: non-target subtopic`)
  require(lesson?.coveredSubtopicIds.includes(card.subtopicId), `${card.id}: lesson/subtopic mismatch`)
  const allowedSources = new Set(allowedSourcesBySubtopic[card.subtopicId])
  for (const sourceId of card.sourceRefs) {
    require(sourcesById.get(sourceId)?.status === 'reviewed', `${card.id}: unclosed source ${sourceId}`)
    require(allowedSources.has(sourceId), `${card.id}: source scope mismatch ${sourceId}`)
  }
  for (const ref of card.pastPaperRefs) {
    require(lesson?.pastPaperRefs.includes(ref), `${card.id}: ref not present in parent lesson ${ref}`)
    validateQuestionRef(ref, card.id, [card.subtopicId])
  }
  if (zeroDirect.has(card.subtopicId) || card.subtopicId === 'im-it-prog-language-runtime') {
    require(card.pastPaperRefs.length === 0, `${card.id}: unsafe/zero-direct subtopic must not claim refs`)
  }
}

const serializedFragments = JSON.stringify({ lessons, cards })
for (const ref of unsafeQuestionIds) {
  require(!serializedFragments.includes(ref), `unsafe ref remains in fragments: ${ref}`)
}
for (const unsupportedClaim of ['CI/CD', 'version control', 'src-oracle-oop-concepts', 'link er', '收旂']) {
  require(!serializedFragments.includes(unsupportedClaim), `unsupported or stale text remains: ${unsupportedClaim}`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      lessons: lessons.length,
      coveredSubtopics: covered.size,
      cards: cards.length,
      lessonEligibleRefs: lessons.reduce((count, lesson) => count + lesson.pastPaperRefs.length, 0),
      reviewedSources: [...new Set(lessons.flatMap((lesson) => lesson.sourceRefs))],
      zeroOrUnsafeDirectCardRefs: 0,
    },
    null,
    2
  )
)
