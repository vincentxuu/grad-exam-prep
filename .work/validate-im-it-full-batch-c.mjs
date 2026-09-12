import fs from 'node:fs'

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const fail = (message) => {
  throw new Error(message)
}

const fragmentLessons = read('.work/im-it-full-batch-c-lessons.json')
const fragmentCards = read('.work/im-it-full-batch-c-cards.json')
const fragmentSources = read('.work/im-it-full-batch-c-sources.json')
const master = read('public/data/im-it-concept-master.json')
const metadata = read('public/data/im-it-question-metadata.json').questions
const answerReviews = read('public/data/im-it-answer-review.json').questions
const sourceRegistry = read('public/data/im-it-source-registry.json').sources
const canonicalLessons = read('public/data/im-it-lessons.json').lessons
const canonicalCards = read('public/data/im-it-concept-cards.json').cards

const targets = [
  'im-it-network-distributed-cloud',
  'im-it-network-performance-reliability',
  'im-it-security-principles-risk',
  'im-it-security-auth-access',
  'im-it-security-network-defense',
  'im-it-security-application-attacks',
  'im-it-security-malware-social',
  'im-it-security-governance-privacy',
  'im-it-security-blockchain',
  'im-it-ai-neural-networks',
  'im-it-ai-cnn-rnn-sequence',
  'im-it-ai-transformers-attention',
  'im-it-ai-generative-llm',
  'im-it-ai-ethics-governance',
]
const noDirectRefs = new Set(['im-it-ai-cnn-rnn-sequence', 'im-it-ai-ethics-governance'])
const canonicalSubtopics = new Set(master.topics.flatMap((topic) => topic.subtopics.map((item) => item.id)))
const metadataById = new Map(metadata.map((item) => [item.questionId, item]))
const reviewById = new Map(answerReviews.map((item) => [item.questionId, item]))
const canonicalSourceIds = new Set(sourceRegistry.map((item) => item.id))
if (new Set(fragmentSources.sources.map((item) => item.id)).size !== fragmentSources.sources.length) {
  fail('Fragment source IDs must be unique')
}
if (fragmentSources.sources.some((item) => canonicalSourceIds.has(item.id) || item.status !== 'reviewed')) {
  fail('Fragment sources must be reviewed and must not collide with canonical sources')
}
const sourceById = new Map([...sourceRegistry, ...fragmentSources.sources].map((item) => [item.id, item]))

if (fragmentLessons.subjectId !== 'im-it' || fragmentCards.subjectId !== 'im-it') fail('Wrong subjectId')
if (fragmentLessons.lessons.length !== 6) fail('Batch C must contain six grouped lessons after the AI split')
if (fragmentCards.cards.length !== 28 || fragmentCards.totalCards !== 28) fail('Batch C must contain 28 cards')

const covered = fragmentLessons.lessons.flatMap((lesson) => lesson.coveredSubtopicIds)
if (new Set(covered).size !== targets.length || targets.some((id) => !covered.includes(id))) {
  fail('Batch C must cover each of the 14 target subtopics exactly once')
}
if (covered.some((id) => !canonicalSubtopics.has(id))) fail('Lesson references unknown canonical subtopic')

const lessonById = new Map(fragmentLessons.lessons.map((lesson) => [lesson.id, lesson]))
if (lessonById.size !== fragmentLessons.lessons.length) fail('Lesson IDs must be unique')
const canonicalLessonIds = new Set(canonicalLessons.map((lesson) => lesson.id))
if (fragmentLessons.lessons.some((lesson) => canonicalLessonIds.has(lesson.id))) {
  fail('Fragment lesson ID collides with canonical lesson')
}

for (const lesson of fragmentLessons.lessons) {
  if (lesson.reviewStatus !== 'reviewed') fail(`Lesson is not reviewed: ${lesson.id}`)
  if (!lesson.coveredSubtopicIds.includes(lesson.subtopicId)) fail(`Primary subtopic outside lesson: ${lesson.id}`)
  if (lesson.learningObjectives.length < 3 || lesson.sections.length < 4 || lesson.workedExamples.length < 2 || lesson.commonPitfalls.length < 4) {
    fail(`Lesson structure incomplete: ${lesson.id}`)
  }
  const scenario = lesson.learningScenario
  if (!scenario?.hook || !scenario.predict || !scenario.boundary) fail(`Scenario prose missing: ${lesson.id}`)
  if (scenario.mapping.length < 4 || scenario.mapping.length > 5 || scenario.examCues.length !== 4) {
    fail(`Scenario mapping/cues invalid: ${lesson.id}`)
  }
  if (new Set(lesson.pastPaperRefs).size < lesson.minimumPastPaperRefs) fail(`Lesson evidence below minimum: ${lesson.id}`)
  for (const id of lesson.pastPaperRefs) {
    const meta = metadataById.get(id)
    const review = reviewById.get(id)
    if (!meta?.publication.autoGradeEligible || !review?.autoGradeEligible) fail(`Ineligible lesson ref: ${id}`)
    if (!lesson.coveredSubtopicIds.includes(meta.primarySubtopicId)) fail(`Ref outside lesson taxonomy: ${id}`)
  }
  for (const id of lesson.sourceRefs) {
    if (sourceById.get(id)?.status !== 'reviewed') fail(`Unknown or unreviewed lesson source: ${id}`)
  }
}

for (const subtopicId of noDirectRefs) {
  const lesson = fragmentLessons.lessons.find((item) => item.coveredSubtopicIds.includes(subtopicId))
  if (!lesson?.evidenceNote?.includes('沒有 direct primary past-paper refs')) {
    fail(`AI foundational subtopic requires an explicit zero-direct-ref evidenceNote: ${subtopicId}`)
  }
}

const neuralLesson = fragmentLessons.lessons.find((lesson) => lesson.id === 'lesson-im-it-ai-neural-sequence-transformer-01')
const genAiLesson = fragmentLessons.lessons.find((lesson) => lesson.id === 'lesson-im-it-ai-generative-governance-01')
if (neuralLesson?.coveredSubtopicIds.join(',') !== [
  'im-it-ai-neural-networks',
  'im-it-ai-cnn-rnn-sequence',
  'im-it-ai-transformers-attention',
].join(',')) fail('Neural/Transformer lesson grouping changed unexpectedly')
if (genAiLesson?.coveredSubtopicIds.join(',') !== [
  'im-it-ai-generative-llm',
  'im-it-ai-ethics-governance',
].join(',')) fail('GenAI/governance lesson grouping changed unexpectedly')

const requiredLessonSources = new Map([
  ['lesson-im-it-security-risk-access-governance-01', ['src-nist-privacy-framework']],
  ['lesson-im-it-security-blockchain-01', ['src-nist-ir-8202-blockchain']],
  ['lesson-im-it-ai-neural-sequence-transformer-01', ['src-stanford-cs224n']],
  ['lesson-im-it-ai-generative-governance-01', ['src-stanford-cs224n', 'src-nist-ai-rmf-1', 'src-nist-ai-600-1-genai-profile']],
])
for (const [lessonId, requiredSources] of requiredLessonSources) {
  const lesson = lessonById.get(lessonId)
  if (!requiredSources.every((sourceId) => lesson?.sourceRefs.includes(sourceId))) {
    fail(`Required reviewed source missing from lesson: ${lessonId}`)
  }
}

const cardsBySubtopic = new Map(targets.map((id) => [id, []]))
if (new Set(fragmentCards.cards.map((card) => card.id)).size !== fragmentCards.cards.length) fail('Card IDs must be unique')
const canonicalCardIds = new Set(canonicalCards.map((card) => card.id))
if (fragmentCards.cards.some((card) => canonicalCardIds.has(card.id))) {
  fail('Fragment card ID collides with canonical card')
}
for (const card of fragmentCards.cards) {
  const lesson = lessonById.get(card.lessonId)
  if (!lesson || !lesson.coveredSubtopicIds.includes(card.subtopicId)) fail(`Card outside lesson: ${card.id}`)
  if (card.reviewStatus !== 'reviewed') fail(`Card is not reviewed: ${card.id}`)
  if (!card.sourceRefs.every((id) => lesson.sourceRefs.includes(id) && sourceById.get(id)?.status === 'reviewed')) {
    fail(`Card source boundary broken: ${card.id}`)
  }
  if (!card.pastPaperRefs.every((id) => lesson.pastPaperRefs.includes(id) && metadataById.get(id)?.publication.autoGradeEligible && reviewById.get(id)?.autoGradeEligible)) {
    fail(`Card evidence boundary broken: ${card.id}`)
  }
  if (card.pastPaperRefs.some((id) => metadataById.get(id)?.primarySubtopicId !== card.subtopicId)) {
    fail(`Card ref does not directly match card subtopic: ${card.id}`)
  }
  cardsBySubtopic.get(card.subtopicId)?.push(card)
}

const unsupportedRefCards = [
  'card-im-it-network-performance-reliability-01',
  'card-im-it-security-governance-privacy-02',
  'card-im-it-security-malware-social-02',
  'card-im-it-ai-neural-networks-02',
  'card-im-it-ai-transformers-attention-02',
]
for (const cardId of unsupportedRefCards) {
  const card = fragmentCards.cards.find((item) => item.id === cardId)
  if (!card || card.pastPaperRefs.length !== 0) fail(`Unsupported semantic paper ref restored: ${cardId}`)
}

for (const [subtopicId, cards] of cardsBySubtopic) {
  if (cards.length < 2) fail(`Subtopic has fewer than two cards: ${subtopicId}`)
  if (noDirectRefs.has(subtopicId) && cards.some((card) => card.pastPaperRefs.length > 0)) {
    fail(`Zero-direct-ref subtopic must not borrow card-level refs: ${subtopicId}`)
  }
}

process.stdout.write('Validated IM-IT Batch C: 6 lessons, 14 subtopics, 28 cards, 5 reviewed source additions, eligible and direct card refs only.\n')
