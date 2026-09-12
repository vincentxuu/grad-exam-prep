import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const conceptFile = 'public/data/im-it-concept-master.json'
const metadataFile = 'public/data/im-it-question-metadata.json'
const manifest = read('.work/im-it-batch4-taxonomy-manifest.json')

if (manifest.applyStatus !== 'approved_for_application') {
  throw new Error(`Unapproved taxonomy manifest: ${manifest.applyStatus}`)
}

const conceptMaster = read(conceptFile)
const metadata = read(metadataFile)
const topicBySubtopicId = new Map(
  conceptMaster.topics.flatMap((topic) =>
    topic.subtopics.map((subtopic) => [subtopic.id, topic.id]),
  ),
)
const movedIds = new Set()

for (const move of manifest.moves) {
  if (movedIds.has(move.questionId)) throw new Error(`Duplicate move ${move.questionId}`)
  movedIds.add(move.questionId)

  const question = metadata.questions.find((entry) => entry.questionId === move.questionId)
  if (!question) throw new Error(`Unknown question ${move.questionId}`)
  if (!topicBySubtopicId.has(move.toSubtopicId)) {
    throw new Error(`Unknown target subtopic ${move.toSubtopicId}`)
  }
  if (question.primarySubtopicId !== move.toSubtopicId) {
    if (question.primarySubtopicId !== move.fromSubtopicId) {
      throw new Error(
        `${move.questionId} expected ${move.fromSubtopicId}, got ${question.primarySubtopicId}`,
      )
    }
    question.primarySubtopicId = move.toSubtopicId
  }
  question.topicId = topicBySubtopicId.get(move.toSubtopicId)
  question.taxonomyRationale = move.reason
}

const invalid = metadata.questions.filter(
  (question) => topicBySubtopicId.get(question.primarySubtopicId) !== question.topicId,
)
if (invalid.length) throw new Error(`Invalid taxonomy rows: ${invalid.map((entry) => entry.questionId)}`)

write(metadataFile, metadata)
console.log(JSON.stringify({ movedQuestions: movedIds.size }))
