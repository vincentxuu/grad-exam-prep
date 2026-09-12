import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions;
const answers = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8')).answers;
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8')).questions;
const reviews = JSON.parse(fs.readFileSync('.work/im-it-answer-review-110-112.json', 'utf8'));

const fail = (condition, message) => {
  if (!condition) throw new Error(message);
};

const questionById = new Map(questions.map((q) => [q.id, q]));
const expected = metadata
  .filter((row) => {
    const question = questionById.get(row.questionId);
    return row.questionType === 'single_choice'
      && question?.subjectId === 'im-it'
      && question.year >= 110
      && question.year <= 112;
  })
  .map((row) => row.questionId)
  .sort();
const actual = reviews.map((row) => row.questionId).sort();

fail(reviews.length === 80, `Expected 80 reviews, received ${reviews.length}`);
fail(new Set(actual).size === actual.length, 'Duplicate review questionId found');
fail(JSON.stringify(actual) === JSON.stringify(expected), 'Review IDs do not exactly cover metadata single_choice IDs for 110–112');

const allowedVerdicts = new Set(['confirmed', 'corrected', 'disputed', 'insufficient']);
const allowedConfidence = new Set(['medium', 'low', 'disputed']);
for (const row of reviews) {
  fail(answers[row.questionId], `Missing current answer for ${row.questionId}`);
  fail(row.currentAnswer === answers[row.questionId].answer, `currentAnswer drift for ${row.questionId}`);
  fail(allowedVerdicts.has(row.verdict), `Invalid verdict for ${row.questionId}`);
  fail(allowedConfidence.has(row.confidence), `Invalid confidence for ${row.questionId}`);
  fail(typeof row.reasoning === 'string' && row.reasoning.length >= 20, `Reasoning too short for ${row.questionId}`);
  fail(Array.isArray(row.sourceBasis) && row.sourceBasis.length >= 3, `Missing source basis for ${row.questionId}`);

  if (row.verdict === 'confirmed') {
    fail(row.confidence === 'medium', `Confirmed row must be medium: ${row.questionId}`);
    fail(row.reviewedAnswer === row.currentAnswer, `Confirmed row changed answer: ${row.questionId}`);
    fail(row.autoGradeEligible === true, `Confirmed row must be eligible: ${row.questionId}`);
  } else if (row.verdict === 'corrected') {
    fail(row.confidence === 'medium', `Corrected row must be medium: ${row.questionId}`);
    fail(/^[A-E]$/.test(row.reviewedAnswer), `Corrected row lacks reviewed answer: ${row.questionId}`);
    fail(row.reviewedAnswer !== row.currentAnswer, `Corrected row did not change answer: ${row.questionId}`);
    fail(row.autoGradeEligible === true, `Corrected row must be eligible after reproducible derivation: ${row.questionId}`);
  } else {
    fail(row.autoGradeEligible === false, `Unresolved row cannot auto-grade: ${row.questionId}`);
    fail(row.reviewedAnswer === null, `Unresolved row must not claim a reviewed answer: ${row.questionId}`);
  }
}

const byYear = Object.fromEntries([110, 111, 112].map((year) => [
  year,
  reviews.filter((row) => questionById.get(row.questionId)?.year === year).length,
]));
const byVerdict = Object.fromEntries([...allowedVerdicts].map((verdict) => [
  verdict,
  reviews.filter((row) => row.verdict === verdict).length,
]));

process.stdout.write(`${JSON.stringify({
  total: reviews.length,
  unique: new Set(actual).size,
  expectedSingleChoiceCoverage: expected.length,
  byYear,
  byVerdict,
  autoGradeEligible: reviews.filter((row) => row.autoGradeEligible).length,
}, null, 2)}\n`);
