const fs = require('fs')

const questionManifest = JSON.parse(fs.readFileSync('.work/im-it-112-replacements.json', 'utf8'))
const answerManifest = JSON.parse(fs.readFileSync('.work/im-it-112-answer-replacements.json', 'utf8'))
const questions = questionManifest.questions
const answers = answerManifest.answers
const errors = []

if (questions.length !== 29) errors.push(`expected 29 questions, got ${questions.length}`)
if (Object.keys(answers).length !== 29) errors.push(`expected 29 answers, got ${Object.keys(answers).length}`)

for (let number = 1; number <= 29; number++) {
  const id = `q-pp-im-it-112-${number}`
  const q = questions[number - 1]
  if (!q || q.id !== id || q.number !== number) errors.push(`question ${number}: missing or out of order`)
  if (!answers[id] || answers[id].questionId !== id) errors.push(`answer ${number}: missing or bad questionId`)
  if (q?.paperId !== 'pp-im-it-112' || q?.examId !== 'im' || q?.subjectId !== 'im-it' || q?.year !== 112) {
    errors.push(`question ${number}: identity fields invalid`)
  }
  if (q?.hasImage !== false) errors.push(`question ${number}: hasImage must be false`)
  if (!q?.text?.trim()) errors.push(`question ${number}: empty text`)
  if (!answers[id]?.explanation?.trim()) errors.push(`answer ${number}: empty explanation`)
}

for (const q of questions.slice(0, 28)) {
  if (q.points !== 2.5) errors.push(`question ${q.number}: expected 2.5 points`)
  if (q.subQuestions.length !== 0) errors.push(`question ${q.number}: unexpected subQuestions`)
  for (const label of ['(A)', '(B)', '(C)', '(D)', '(E)']) {
    if (!q.text.includes(label)) errors.push(`question ${q.number}: missing ${label}`)
  }
  if (!/^[A-E]$/.test(answers[q.id]?.answer ?? '')) errors.push(`question ${q.number}: invalid MCQ answer`)
}

const q29 = questions[28]
if (q29.points !== 30) errors.push('question 29: expected 30 points')
if (q29.subQuestions.length !== 3) errors.push('question 29: expected 3 subQuestions')
if (!q29.text.includes('void search(string txt, string pat)')) errors.push('question 29: correct search signature missing')
if (q29.text.includes('void search(string txt, string pat, string badchar)')) errors.push('question 29: corrupted search signature remains')
for (const label of ['(a)', '(b)', '(c)']) {
  if (!q29.subQuestions.some((sq) => sq.startsWith(label))) errors.push(`question 29: missing ${label}`)
}

const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
if (totalPoints !== 100) errors.push(`expected 100 total points, got ${totalPoints}`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(JSON.stringify({
  questions: questions.length,
  answers: Object.keys(answers).length,
  totalPoints,
  multipleChoice: 28,
  q29SubQuestions: q29.subQuestions.length,
  q29Signature: 'void search(string txt, string pat)',
  hasImageTrue: questions.filter((q) => q.hasImage).length,
}, null, 2))
