import { readFileSync, writeFileSync } from 'node:fs'

const selectedSubtopics = new Set([
  'im-it-arch-cpu-organization',
  'im-it-security-cryptography',
  'im-it-os-file-storage-io',
  'im-it-os-virtualization-containers',
  'im-it-network-link-lan',
])

const excludedQuestionIds = new Set([
  // Blockchain/mining questions are currently misclassified as core cryptography.
  'q-pp-im-it-107-18',
  'q-pp-im-it-110-26',
])

const metadata = JSON.parse(readFileSync('public/data/im-it-question-metadata.json', 'utf8'))
const questions = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const answers = JSON.parse(readFileSync('public/data/answers.json', 'utf8'))
const concepts = JSON.parse(readFileSync('public/data/im-it-concept-master.json', 'utf8'))

const questionsById = new Map(questions.questions.map((question) => [question.id, question]))
const answersById = new Map(Object.entries(answers.answers))
const subtopicsById = new Map(
  concepts.topics.flatMap((topic) =>
    topic.subtopics.map((subtopic) => [subtopic.id, { ...subtopic, topicTitle: topic.title }])
  )
)

const output = {}
for (const subtopicId of selectedSubtopics) {
  const entries = metadata.questions.filter(
    (entry) =>
      entry.primarySubtopicId === subtopicId &&
      entry.publication.autoGradeEligible &&
      !excludedQuestionIds.has(entry.questionId)
  )
  output[subtopicId] = {
    concept: subtopicsById.get(subtopicId),
    taxonomyCount: metadata.questions.filter((entry) => entry.primarySubtopicId === subtopicId)
      .length,
    autoGradeEligibleCount: entries.length,
    questions: entries.map((entry) => ({
      metadata: entry,
      question: questionsById.get(entry.questionId),
      answer: answersById.get(entry.questionId),
    })),
  }
}

writeFileSync('.work/im-it-batch2-input.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(
  Object.fromEntries(
    Object.entries(output).map(([id, value]) => [id, value.autoGradeEligibleCount])
  )
)
