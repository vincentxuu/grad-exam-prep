import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'public/data')
const questionPath = path.join(dataDir, 'questions.json')
const answerPath = path.join(dataDir, 'answers.json')
const qfilesDir = path.join(dataDir, 'qfiles')

const replacementFiles = [
  '.work/im-it-107-replacements.json',
  '.work/im-it-112-replacements.json',
  '.work/im-it-109-110-113-replacements.json',
]
const answerReplacementFiles = [
  '.work/im-it-107-answer-replacements.json',
  '.work/im-it-112-answer-replacements.json',
  '.work/im-it-109-110-113-answer-replacements.json',
]

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function loadArrays(files) {
  return files.flatMap((file) => {
    if (!fs.existsSync(file)) throw new Error(`Missing repair manifest: ${file}`)
    const value = readJson(file)
    if (Array.isArray(value)) return value
    if (Array.isArray(value.questions)) return value.questions
    if (Array.isArray(value.replacements)) return value.replacements
    if (value.answers && typeof value.answers === 'object') return Object.values(value.answers)
    throw new Error(`Unsupported repair manifest shape: ${file}`)
  })
}

function assertUnique(items, key, label) {
  const duplicates = [...Map.groupBy(items, (item) => item[key])]
    .filter(([, group]) => group.length > 1)
    .map(([value]) => value)
  if (duplicates.length) throw new Error(`Duplicate ${label}: ${duplicates.join(', ')}`)
}

function writeAtomic(file, contents) {
  const temporary = `${file}.tmp`
  fs.writeFileSync(temporary, contents)
  fs.renameSync(temporary, file)
}

const replacements = loadArrays(replacementFiles)
const answerReplacements = loadArrays(answerReplacementFiles)
assertUnique(replacements, 'id', 'question replacement id')
assertUnique(answerReplacements, 'questionId', 'answer replacement id')

const questionData = readJson(questionPath)
const questionById = new Map(questionData.questions.map((question) => [question.id, question]))

for (const replacement of replacements) {
  const current = questionById.get(replacement.id)
  if (!current) throw new Error(`Unknown question replacement id: ${replacement.id}`)
  if (current.subjectId !== 'im-it') throw new Error(`Replacement outside im-it: ${replacement.id}`)
  if (!replacement.text?.trim()) throw new Error(`Replacement has no text: ${replacement.id}`)

  Object.assign(current, {
    text: replacement.text,
    points: replacement.points ?? current.points,
    hasImage: replacement.hasImage ?? current.hasImage,
    subQuestions: replacement.subQuestions ?? current.subQuestions,
  })

}

questionData.totalQuestions = questionData.questions.length
writeAtomic(questionPath, `${JSON.stringify(questionData, null, 2)}\n`)

for (const question of questionData.questions.filter((item) => item.subjectId === 'im-it')) {
  const qfilePath = path.join(qfilesDir, `${question.id}.json`)
  const qfile = readJson(qfilePath)
  qfile.text = question.text
  writeAtomic(qfilePath, `${JSON.stringify(qfile)}\n`)
}

const answerData = readJson(answerPath)
for (const replacement of answerReplacements) {
  if (!questionById.has(replacement.questionId)) {
    throw new Error(`Unknown answer replacement id: ${replacement.questionId}`)
  }
  if (!replacement.answer?.trim() || !replacement.explanation?.trim()) {
    throw new Error(`Incomplete answer replacement: ${replacement.questionId}`)
  }
  answerData.answers[replacement.questionId] = replacement
}
writeAtomic(answerPath, `${JSON.stringify(answerData, null, 2)}\n`)

console.log(
  JSON.stringify(
    {
      questionReplacements: replacements.length,
      answerReplacements: answerReplacements.length,
      totalQuestions: questionData.totalQuestions,
    },
    null,
    2,
  ),
)
