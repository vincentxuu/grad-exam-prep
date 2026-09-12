import fs from 'node:fs';

const years = new Set([113, 114, 115]);
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8'));
const reviews = JSON.parse(fs.readFileSync('.work/im-it-answer-review-113-115.json', 'utf8'));
const expected = metadata.questions
  .filter((item) => years.has(Number(item.paperId.slice(-3))) && item.questionType === 'single_choice')
  .map((item) => item.questionId)
  .sort();
const excluded = metadata.questions
  .filter((item) => years.has(Number(item.paperId.slice(-3))) && item.questionType !== 'single_choice')
  .map((item) => item.questionId)
  .sort();
const actual = reviews.map((item) => item.questionId).sort();
const duplicates = actual.filter((id, index) => actual.indexOf(id) !== index);
const missing = expected.filter((id) => !actual.includes(id));
const extra = actual.filter((id) => !expected.includes(id));
const allowedVerdicts = new Set(['confirmed', 'corrected', 'disputed', 'insufficient']);
const allowedConfidence = new Set(['medium', 'low', 'disputed']);
const malformed = reviews.filter((item) =>
  !item.currentAnswer || !item.reviewedAnswer || !allowedVerdicts.has(item.verdict) ||
  !allowedConfidence.has(item.confidence) || !item.reasoning || !Array.isArray(item.sourceBasis) ||
  item.sourceBasis.length === 0 || typeof item.autoGradeEligible !== 'boolean' ||
  ((item.verdict === 'disputed' || item.verdict === 'insufficient') && item.autoGradeEligible));

if (duplicates.length || missing.length || extra.length || malformed.length) {
  console.error(JSON.stringify({ duplicates, missing, extra, malformed: malformed.map((x) => x.questionId) }, null, 2));
  process.exit(1);
}

const countBy = (key) => Object.fromEntries(Object.entries(Object.groupBy(reviews, (item) => item[key])).map(([k, v]) => [k, v.length]));
const byYear = Object.fromEntries(Object.entries(Object.groupBy(reviews, (item) => item.questionId.match(/-(113|114|115)-/)[1])).map(([k, v]) => [k, v.length]));
console.log(JSON.stringify({
  total: reviews.length,
  expected: expected.length,
  excludedNonSingleChoice: excluded,
  byYear,
  verdicts: countBy('verdict'),
  confidence: countBy('confidence'),
  autoGradeEligible: reviews.filter((item) => item.autoGradeEligible).length,
}, null, 2));
