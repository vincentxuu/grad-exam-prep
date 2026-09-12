import fs from 'node:fs';

const years = new Set([113, 114, 115]);
const questionsDoc = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8'));
const answersDoc = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8'));
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8'));
const singleIds = new Set(metadata.questions
  .filter((item) => years.has(Number(item.paperId.slice(-3))) && item.questionType === 'single_choice')
  .map((item) => item.questionId));

const selected = questionsDoc.questions
  .filter((question) => singleIds.has(question.id))
  .sort((a, b) => a.year - b.year || a.number - b.number)
  .map((question) => ({
    id: question.id,
    year: question.year,
    number: question.number,
    text: question.text,
    choices: question.choices,
    currentAnswer: answersDoc.answers[question.id]?.answer,
    explanation: answersDoc.answers[question.id]?.explanation,
  }));

fs.writeFileSync('.work/im-it-answer-review-113-115-input.json', `${JSON.stringify(selected, null, 2)}\n`);
console.log(JSON.stringify({ count: selected.length, byYear: Object.groupBy(selected, (q) => q.year) }, (_key, value) => Array.isArray(value) ? value.length : value, 2));
