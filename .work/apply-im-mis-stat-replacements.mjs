import fs from 'node:fs'

const questionManifestFiles = [
  '.work/im-mis-106-110-replacements.json',
  '.work/im-mis-111-115-replacements.json',
  '.work/im-stat-114-115-replacements.json',
]
const answerManifestFiles = [
  '.work/im-mis-106-110-answer-replacements.json',
  '.work/im-mis-111-115-answer-replacements.json',
  '.work/im-stat-114-115-answer-replacements.json',
]

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function loadManifests(files) {
  return files.flatMap((file) => {
    if (!fs.existsSync(file)) throw new Error(`Missing manifest: ${file}`)
    const value = readJson(file)
    if (Array.isArray(value)) return value
    if (Array.isArray(value.replacements)) return value.replacements
    throw new Error(`Unsupported manifest shape: ${file}`)
  })
}

function assertUnique(items, key, label) {
  const seen = new Set()
  for (const item of items) {
    if (seen.has(item[key])) throw new Error(`Duplicate ${label}: ${item[key]}`)
    seen.add(item[key])
  }
}

function writeAtomic(file, value) {
  const temporary = `${file}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temporary, file)
}

const questionReplacements = loadManifests(questionManifestFiles)
const answerReplacements = loadManifests(answerManifestFiles)
assertUnique(questionReplacements, 'id', 'question id')
assertUnique(answerReplacements, 'questionId', 'answer id')

const questionPath = 'public/data/questions.json'
const questionData = readJson(questionPath)
const questionById = new Map(questionData.questions.map((question) => [question.id, question]))

for (const replacement of questionReplacements) {
  const current = questionById.get(replacement.id)
  if (!current) throw new Error(`Unknown question: ${replacement.id}`)
  if (!['im-mis', 'im-stat'].includes(current.subjectId)) {
    throw new Error(`Replacement outside MIS/statistics: ${replacement.id}`)
  }
  if (!replacement.text?.trim()) throw new Error(`Missing replacement text: ${replacement.id}`)
  Object.assign(current, {
    text: replacement.text,
    points: replacement.points ?? current.points,
    hasImage: replacement.hasImage ?? current.hasImage,
    subQuestions: replacement.subQuestions ?? current.subQuestions,
  })
}

questionData.totalQuestions = questionData.questions.length
writeAtomic(questionPath, questionData)

const answerPath = 'public/data/answers.json'
const answerData = readJson(answerPath)
for (const replacement of answerReplacements) {
  if (!questionById.has(replacement.questionId)) {
    throw new Error(`Unknown answer question: ${replacement.questionId}`)
  }
  if (replacement.answer !== 'N/A' || replacement.explanation?.trim().length < 80) {
    throw new Error(`Invalid essay answer replacement: ${replacement.questionId}`)
  }
  answerData.answers[replacement.questionId] = replacement
}
writeAtomic(answerPath, answerData)

const statisticsManifest = readJson('.work/im-stat-114-115-replacements.json')
const questionImagesPath = 'public/data/question-images.json'
const questionImages = readJson(questionImagesPath)
for (const repair of statisticsManifest.imageRepairs?.questionImageMappings ?? []) {
  questionImages[repair.questionId] = repair.replacement
}
writeAtomic(questionImagesPath, questionImages)

console.log(
  JSON.stringify(
    {
      questionReplacements: questionReplacements.length,
      answerReplacements: answerReplacements.length,
      imageMappingRepairs: statisticsManifest.imageRepairs?.questionImageMappings?.length ?? 0,
      totalQuestions: questionData.totalQuestions,
    },
    null,
    2,
  ),
)
