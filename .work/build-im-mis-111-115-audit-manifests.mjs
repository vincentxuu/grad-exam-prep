import fs from 'node:fs';

const questionsPath = new URL('../public/data/questions.json', import.meta.url);
const answersPath = new URL('../public/data/answers.json', import.meta.url);
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8')).questions;
const answers = JSON.parse(fs.readFileSync(answersPath, 'utf8')).answers;

const subQuestions = {
  'q-pp-im-mis-111-1': ['a', 'b', 'c'],
  'q-pp-im-mis-111-2': ['a', 'b'],
  'q-pp-im-mis-111-4': ['a', 'b'],
  'q-pp-im-mis-112-1': ['a', 'b', 'c'],
  'q-pp-im-mis-112-2': ['a', 'b', 'c'],
  'q-pp-im-mis-112-4': ['a', 'b'],
  'q-pp-im-mis-113-1': ['a', 'b'],
  'q-pp-im-mis-113-2': ['a', 'b', 'c'],
  'q-pp-im-mis-113-3': ['a', 'b'],
  'q-pp-im-mis-113-4': ['a', 'b'],
  'q-pp-im-mis-114-1': ['A', 'B'],
  'q-pp-im-mis-114-2': ['A', 'B'],
  'q-pp-im-mis-115-2': ['A', 'B', 'C'],
};

const evidencePages = {
  'q-pp-im-mis-111-1': [1, 2],
  'q-pp-im-mis-111-2': [2],
  'q-pp-im-mis-111-4': [2],
  'q-pp-im-mis-112-1': [1],
  'q-pp-im-mis-112-2': [1],
  'q-pp-im-mis-112-4': [1],
  'q-pp-im-mis-113-1': [1],
  'q-pp-im-mis-113-2': [1],
  'q-pp-im-mis-113-3': [1],
  'q-pp-im-mis-113-4': [2],
  'q-pp-im-mis-114-1': [1],
  'q-pp-im-mis-114-2': [1],
  'q-pp-im-mis-115-2': [1],
};

const answerEvidencePages = {
  'q-pp-im-mis-111-1': [1, 2],
  'q-pp-im-mis-111-2': [2],
  'q-pp-im-mis-111-3': [2],
  'q-pp-im-mis-111-4': [2],
  'q-pp-im-mis-112-1': [1],
  'q-pp-im-mis-112-2': [1],
  'q-pp-im-mis-112-3': [1],
  'q-pp-im-mis-112-4': [1],
  'q-pp-im-mis-113-1': [1],
  'q-pp-im-mis-113-2': [1],
  'q-pp-im-mis-113-3': [1],
  'q-pp-im-mis-113-4': [2],
  'q-pp-im-mis-114-1': [1],
  'q-pp-im-mis-114-2': [1],
  'q-pp-im-mis-114-3': [1],
  'q-pp-im-mis-115-1': [1],
  'q-pp-im-mis-115-2': [1],
};

const missingParagraph = "Besides evaluating individual IT projects, this benefit-risk classification of IT projects allows CIOs (or CEOs) to determine the optimal mix of IT investments for their firms. The optimal mix of IT investments is affected by the firm's competitive strategies, the characteristics of the industry to which the firm belongs, and so on.";

const replacements = Object.entries(subQuestions).map(([id, subs]) => {
  const question = questions.find((item) => item.id === id);
  if (!question) throw new Error(`Missing question ${id}`);
  let text = question.text;
  if (id === 'q-pp-im-mis-111-1') {
    text = text.replace('\n\n(b) When a firm pursues', `\n\n${missingParagraph}\n\n(b) When a firm pursues`);
  }
  return {
    id,
    text,
    points: question.points,
    hasImage: question.hasImage,
    subQuestions: subs,
    evidencePages: evidencePages[id],
  };
});

const auditedIds = questions
  .filter((item) => item.subjectId === 'im-mis' && item.year >= 111 && item.year <= 115)
  .map((item) => item.id);

const answerReplacements = auditedIds
  .filter((id) => answers[id]?.answer !== 'N/A')
  .map((id) => ({
    questionId: id,
    answer: 'N/A',
    explanation: answers[id].explanation,
    evidencePages: answerEvidencePages[id],
    reason: 'The PDF presents an open-ended essay question with no answer choices; a letter answer is not applicable.',
  }));

fs.writeFileSync(new URL('im-mis-111-115-replacements.json', import.meta.url), `${JSON.stringify(replacements, null, 2)}\n`);
fs.writeFileSync(new URL('im-mis-111-115-answer-replacements.json', import.meta.url), `${JSON.stringify(answerReplacements, null, 2)}\n`);

console.log(JSON.stringify({ questionReplacements: replacements.length, answerReplacements: answerReplacements.length }));
