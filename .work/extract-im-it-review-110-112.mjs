import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions;
const answers = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8')).answers;
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8')).questions;
const singleChoiceIds = new Set(metadata
  .filter((row) => row.questionType === 'single_choice')
  .map((row) => row.questionId));

const rows = questions
  .filter((q) => q.subjectId === 'im-it' && q.year >= 110 && q.year <= 112 && singleChoiceIds.has(q.id))
  .sort((a, b) => a.year - b.year || a.number - b.number)
  .map((q) => ({
    id: q.id,
    year: q.year,
    number: q.number,
    text: q.text,
    currentAnswer: answers[q.id]?.answer ?? null,
    explanation: answers[q.id]?.explanation ?? null,
  }));

process.stdout.write(JSON.stringify(rows, null, 2));
