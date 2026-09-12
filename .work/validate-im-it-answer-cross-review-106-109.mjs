import fs from 'node:fs';

const first = JSON.parse(fs.readFileSync('.work/im-it-answer-review-106-109.json', 'utf8'))
  .filter((item) => item.verdict !== 'confirmed');
const second = JSON.parse(fs.readFileSync('.work/im-it-answer-cross-review-106-109.json', 'utf8'));
const expected = first.map((item) => item.questionId).sort();
const actual = second.map((item) => item.questionId).sort();
const duplicate = actual.filter((id, index) => actual.indexOf(id) !== index);
const missing = expected.filter((id) => !actual.includes(id));
const extra = actual.filter((id) => !expected.includes(id));
const verdicts = new Set(['agree_corrected', 'agree_disputed', 'confirm_current', 'alternative_correction', 'insufficient']);
const malformed = second.filter((item) =>
  !verdicts.has(item.secondVerdict) || !item.reasoning || !Array.isArray(item.sourceBasis) ||
  item.sourceBasis.length === 0 || typeof item.consensus !== 'boolean');
if (duplicate.length || missing.length || extra.length || malformed.length) {
  console.error(JSON.stringify({ duplicate, missing, extra, malformed: malformed.map((x) => x.questionId) }, null, 2));
  process.exit(1);
}
const counts = Object.fromEntries(Object.entries(Object.groupBy(second, (item) => item.secondVerdict)).map(([key, values]) => [key, values.length]));
console.log(JSON.stringify({ total: second.length, expected: expected.length, duplicate, missing, extra, counts, consensus: second.filter((x) => x.consensus).length }, null, 2));
