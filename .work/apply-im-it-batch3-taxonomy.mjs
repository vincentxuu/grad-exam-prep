import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const conceptFile = 'public/data/im-it-concept-master.json'
const metadataFile = 'public/data/im-it-question-metadata.json'
const subjectsFile = 'public/data/subjects-im.json'
const conceptMaster = read(conceptFile)
const metadata = read(metadataFile)
const subjects = read(subjectsFile)
const manifests = [
  read('.work/im-it-batch3-ds-taxonomy-manifest.json'),
  read('.work/im-it-batch3-ai-taxonomy-manifest.json'),
  read('.work/im-it-batch3-security-taxonomy-manifest.json'),
]
const unapprovedManifests = manifests.filter(
  (manifest) => manifest.applyStatus !== 'approved_for_application',
)
if (unapprovedManifests.length) {
  throw new Error(
    `Unapproved taxonomy manifests: ${unapprovedManifests.map((manifest) => manifest.topicId)}`,
  )
}

const proposedTopics = manifests.flatMap((manifest) => manifest.proposedTopics ?? [])
for (const proposed of proposedTopics) {
  const existing = conceptMaster.topics.find((entry) => entry.id === proposed.id)
  if (!existing) {
    conceptMaster.topics.push({
      id: proposed.id,
      title: proposed.title,
      importance: proposed.importance,
      status: 'reviewed',
      learningObjectives: proposed.learningObjectives,
      subtopics: [],
    })
  }
}
const subject = subjects.find((entry) => entry.id === 'im-it')
if (!subject) throw new Error('Missing im-it subject')
for (const proposed of proposedTopics) {
  if (!conceptMaster.canonicalTopicIds.includes(proposed.id)) {
    conceptMaster.canonicalTopicIds.push(proposed.id)
  }
  if (!subject.topics.some((topic) => topic.id === proposed.id)) {
    subject.topics.push({
      id: proposed.id,
      title: proposed.title,
      importance: proposed.importance,
      subtopics: proposed.displaySubtopics,
    })
  }
}

const subtopicReplacements = Object.assign(
  {},
  ...manifests.map((manifest) => manifest.subtopicReplacements ?? {}),
)
for (const topic of conceptMaster.topics) {
  topic.subtopics = topic.subtopics.filter((subtopic) => !subtopicReplacements[subtopic.id])
}

const proposedSubtopics = manifests.flatMap((manifest) => manifest.proposedSubtopics ?? [])
for (const proposed of proposedSubtopics) {
  const topic = conceptMaster.topics.find((entry) => entry.id === proposed.topicId)
  if (!topic) throw new Error(`Unknown topic for ${proposed.id}`)
  const existing = topic.subtopics.find((entry) => entry.id === proposed.id)
  if (!existing) {
    topic.subtopics.push({
      id: proposed.id,
      topicId: proposed.topicId,
      title: proposed.title,
      keywords: proposed.keywords,
      status: 'reviewed',
    })
  }
}

const moves = [
  ...manifests.flatMap((manifest) => manifest.moves ?? []),
  ...manifests.flatMap((manifest) => manifest.changes ?? []).map((change) => ({
    questionId: change.questionId,
    fromSubtopicId: change.oldPrimarySubtopicId,
    toSubtopicId: change.newPrimarySubtopicId,
    reason: change.reason,
  })),
]
const movedIds = new Set()
for (const move of moves) {
  if (movedIds.has(move.questionId)) throw new Error(`Duplicate taxonomy move ${move.questionId}`)
  movedIds.add(move.questionId)
  const question = metadata.questions.find((entry) => entry.questionId === move.questionId)
  if (!question) throw new Error(`Unknown question ${move.questionId}`)
  if (subtopicReplacements[question.primarySubtopicId] === move.toSubtopicId) {
    question.primarySubtopicId = move.toSubtopicId
    question.taxonomyRationale = move.reason
    continue
  }
  if (question.primarySubtopicId === move.toSubtopicId) continue
  if (question.primarySubtopicId !== move.fromSubtopicId) {
    throw new Error(
      `${move.questionId} expected ${move.fromSubtopicId}, got ${question.primarySubtopicId}`,
    )
  }
  question.primarySubtopicId = move.toSubtopicId
  question.taxonomyRationale = move.reason
}

const subtopicIds = new Set(
  conceptMaster.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id)),
)
const topicBySubtopicId = new Map(
  conceptMaster.topics.flatMap((topic) =>
    topic.subtopics.map((subtopic) => [subtopic.id, topic.id]),
  ),
)
for (const question of metadata.questions) {
  question.topicId = topicBySubtopicId.get(question.primarySubtopicId)
}
const invalid = metadata.questions.filter((question) => !subtopicIds.has(question.primarySubtopicId))
if (invalid.length) throw new Error(`Invalid subtopics: ${invalid.map((entry) => entry.questionId)}`)

write(conceptFile, conceptMaster)
write(metadataFile, metadata)
write(subjectsFile, subjects)
console.log(
  JSON.stringify({
    movedQuestions: movedIds.size,
    totalSubtopics: subtopicIds.size,
    byTopic: Object.fromEntries(
      conceptMaster.topics.map((topic) => [topic.id, topic.subtopics.length]),
    ),
  }),
)
