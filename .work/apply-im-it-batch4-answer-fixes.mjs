import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const answersFile = 'public/data/answers.json'
const manifest = read('.work/im-it-batch4-answer-fixes.json')
if (manifest.reviewStatus !== 'reviewed') {
  throw new Error(`Unreviewed answer fixes: ${manifest.reviewStatus}`)
}

const document = read(answersFile)
const changedIds = new Set()
let updatedExplanations = 0
let alreadyApplied = 0

for (const change of manifest.changes) {
  if (changedIds.has(change.questionId)) {
    throw new Error(`Duplicate answer fix ${change.questionId}`)
  }
  changedIds.add(change.questionId)

  const answer = document.answers[change.questionId]
  if (!answer) throw new Error(`Unknown answer ${change.questionId}`)
  if (answer.answer !== change.answer) {
    throw new Error(`${change.questionId} expected answer ${change.answer}, got ${answer.answer}`)
  }

  if (answer.explanation === change.explanation) {
    alreadyApplied += 1
    continue
  }
  if (typeof change.expectedOldExplanation !== 'string') {
    throw new Error(`${change.questionId} is missing expectedOldExplanation`)
  }
  if (answer.explanation !== change.expectedOldExplanation) {
    throw new Error(`${change.questionId} explanation drifted from expected old value`)
  }

  answer.explanation = change.explanation
  updatedExplanations += 1
}

write(answersFile, document)
console.log(JSON.stringify({ updatedExplanations, alreadyApplied }))
