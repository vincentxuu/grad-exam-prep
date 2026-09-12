import fs from 'node:fs';

const first = JSON.parse(fs.readFileSync('.work/im-it-answer-review-113-115.json', 'utf8'));
const second = JSON.parse(fs.readFileSync('.work/im-it-answer-cross-review-113-115.json', 'utf8'));
const expected = first.filter((row) => row.verdict !== 'confirmed');
const expectedIds = expected.map((row) => row.questionId).sort();
const actualIds = second.map((row) => row.questionId).sort();

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(second.length === 17, `Expected 17 cross reviews, got ${second.length}`);
assert(new Set(actualIds).size === actualIds.length, 'Duplicate questionId found');
assert(JSON.stringify(actualIds) === JSON.stringify(expectedIds), 'Flagged-row coverage mismatch');

const firstById = new Map(expected.map((row) => [row.questionId, row]));
const allowed = new Set(['agree_corrected', 'agree_disputed', 'confirm_current', 'alternative_correction', 'insufficient']);
for (const row of second) {
  const original = firstById.get(row.questionId);
  assert(original, `Unexpected question ${row.questionId}`);
  assert(row.firstVerdict === original.verdict, `firstVerdict drift: ${row.questionId}`);
  assert(row.firstReviewedAnswer === original.reviewedAnswer, `firstReviewedAnswer drift: ${row.questionId}`);
  assert(allowed.has(row.secondVerdict), `Invalid secondVerdict: ${row.questionId}`);
  assert(typeof row.reasoning === 'string' && row.reasoning.length >= 30, `Reasoning too short: ${row.questionId}`);
  assert(Array.isArray(row.sourceBasis) && row.sourceBasis.length >= 3, `Missing sourceBasis: ${row.questionId}`);
  assert(typeof row.consensus === 'boolean', `Invalid consensus: ${row.questionId}`);

  if (row.secondVerdict === 'agree_corrected') {
    assert(row.firstVerdict === 'corrected', `agree_corrected without first correction: ${row.questionId}`);
    assert(row.secondReviewedAnswer === row.firstReviewedAnswer, `Corrected answer disagreement: ${row.questionId}`);
    assert(row.consensus, `Agreement must be consensus: ${row.questionId}`);
  }
  if (row.secondVerdict === 'agree_disputed') {
    assert(row.firstVerdict === 'disputed', `agree_disputed without first dispute: ${row.questionId}`);
    assert(row.secondReviewedAnswer === null, `Disputed question must not claim unique answer: ${row.questionId}`);
    assert(row.consensus, `Agreement must be consensus: ${row.questionId}`);
  }
}

const counts = Object.fromEntries([...allowed].map((verdict) => [
  verdict,
  second.filter((row) => row.secondVerdict === verdict).length,
]));
process.stdout.write(`${JSON.stringify({
  expected: expected.length,
  actual: second.length,
  unique: new Set(actualIds).size,
  counts,
  consensus: second.filter((row) => row.consensus).length,
}, null, 2)}\n`);
