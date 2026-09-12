import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions;
const answers = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8')).answers;
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8')).questions;

const selected = metadata
  .filter((m) => /^q-pp-im-it-(106|107|108|109)-/.test(m.questionId) && m.questionType === 'single_choice')
  .map((m) => {
    const q = questions.find((entry) => entry.id === m.questionId);
    const a = answers[m.questionId];
    return `## ${m.questionId}\nCURRENT: ${a.answer}\n${q.text}\nEXPLANATION: ${a.explanation}\n`;
  });

fs.writeFileSync('.work/im-it-answer-review-source-106-109.md', selected.join('\n'));
console.log(`wrote ${selected.length} questions`);
