import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const root = "/Users/xiaoxu/Projects/grad-exam-prep-conflict-resolution";
const files = {
  answers: "public/data/answers.json",
  answerReview: "public/data/im-it-answer-review.json",
  practice: "public/data/im-it-practice-status.json",
  metadata: "public/data/im-it-question-metadata.json",
};

const fromStage = (stage, file) =>
  JSON.parse(execFileSync("git", ["show", `:${stage}:${file}`], { cwd: root, encoding: "utf8" }));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const writeJson = (file, value) =>
  writeFileSync(`${root}/${file}`, `${JSON.stringify(value, null, 2)}\n`);

// answers.json has a real merge base. Keep the PDF-audited non-English branch for
// IM-IT and all changes unique to that branch. Import non-IM-IT changes made only
// on main, whose repaired question sets are also being merged.
const baseAnswers = fromStage(1, files.answers).answers;
const oursAnswers = fromStage(2, files.answers).answers;
const mainAnswers = fromStage(3, files.answers).answers;
const answerReview = JSON.parse(readFileSync(`${root}/${files.answerReview}`, "utf8"));
const technicallyCorrectedIds = new Set(
  answerReview.questions
    .filter((item) => item.status === "corrected")
    .map((item) => item.questionId),
);
const semanticExplanationRepairIds = new Set([
  'q-pp-im-it-109-13',
  'q-pp-im-it-113-5',
]);
const mergedAnswers = {};
const answerDecisions = { unchanged: 0, ours: 0, main: 0, identical: 0 };

for (const questionId of [...new Set([
  ...Object.keys(oursAnswers),
  ...Object.keys(baseAnswers),
  ...Object.keys(mainAnswers),
])]) {
  const base = baseAnswers[questionId];
  const ours = oursAnswers[questionId];
  const main = mainAnswers[questionId];

  // Main repaired two explanations that were attached to the wrong question
  // in the PDF-audit branch while keeping the same answer field.
  if (semanticExplanationRepairIds.has(questionId)) {
    if (!main || main.answer !== ours?.answer) {
      throw new Error(`Semantic explanation repair changed answer: ${questionId}`);
    }
    mergedAnswers[questionId] = main;
    answerDecisions.main += 1;
    continue;
  }

  // Main's technical review was performed after (and explicitly cites) the
  // non-English branch PDF parity audit. Its 44 consensus corrections therefore
  // supersede both earlier answer variants while preserving that audit lineage.
  if (technicallyCorrectedIds.has(questionId)) {
    if (main?.answer !== answerReview.questions.find((item) => item.questionId === questionId).reviewedAnswer) {
      throw new Error(`Main answer does not match technical review: ${questionId}`);
    }
    mergedAnswers[questionId] = main;
    answerDecisions.main += 1;
    continue;
  }

  if (same(ours, main)) {
    mergedAnswers[questionId] = ours;
    answerDecisions[same(base, ours) ? "unchanged" : "identical"] += 1;
    continue;
  }
  if (same(base, main)) {
    mergedAnswers[questionId] = ours;
    answerDecisions.ours += 1;
    continue;
  }
  if (same(base, ours)) {
    if (questionId.startsWith("q-pp-im-it-")) {
      mergedAnswers[questionId] = ours;
      answerDecisions.ours += 1;
    } else {
      mergedAnswers[questionId] = main;
      answerDecisions.main += 1;
    }
    continue;
  }

  // Any remaining true concurrent conflict must be an IM-IT record where both
  // branches reached the same audited answer but wrote different explanations.
  // Retain the non-English PDF-audit explanation. Abort if that invariant changes.
  if (!questionId.startsWith("q-pp-im-it-") || ours?.answer !== main?.answer) {
    throw new Error(`Unhandled concurrent answer conflict: ${questionId}`);
  }
  mergedAnswers[questionId] = ours;
  answerDecisions.ours += 1;
}

// Both add/add practice files cover the same stable IDs. Eligibility and notes
// are identical; main alone retains whether an audited answer was corrected.
const oursPractice = fromStage(2, files.practice);
const mainPractice = fromStage(3, files.practice);
const mergedPracticeQuestions = {};
for (const questionId of [...new Set([
  ...Object.keys(oursPractice.questions),
  ...Object.keys(mainPractice.questions),
])]) {
  const ours = oursPractice.questions[questionId];
  const main = mainPractice.questions[questionId];
  if (!ours || !main) throw new Error(`Practice ID missing from one branch: ${questionId}`);
  if (
    ours.autoGradeEligible !== main.autoGradeEligible ||
    ours.note !== main.note ||
    !["confirmed", "corrected"].includes(ours.status) ||
    !["confirmed", "corrected"].includes(main.status)
  ) {
    if (!same(ours, main)) throw new Error(`Unexpected practice conflict: ${questionId}`);
  }
  mergedPracticeQuestions[questionId] = {
    ...ours,
    status: main.status,
  };
}
const practiceCounts = Object.values(mergedPracticeQuestions).reduce(
  (counts, record) => {
    if (record.autoGradeEligible) counts.autoGradeEligible += 1;
    else if (record.status === "disputed") counts.disputed += 1;
    else counts.selfReviewOnly += 1;
    return counts;
  },
  { autoGradeEligible: 0, disputed: 0, selfReviewOnly: 0 },
);
const mergedPractice = {
  ...oursPractice,
  counts: practiceCounts,
  questions: mergedPracticeQuestions,
};

// Metadata records are otherwise byte-equivalent. Overlay main's three newer
// blockchain taxonomy corrections while retaining the non-English branch's
// answer source, confidence, and publication/eligibility fields.
const oursMetadata = fromStage(2, files.metadata);
const mainMetadata = fromStage(3, files.metadata);
const oursMetadataById = Object.fromEntries(oursMetadata.questions.map((item) => [item.questionId, item]));
const mainMetadataById = Object.fromEntries(mainMetadata.questions.map((item) => [item.questionId, item]));
const taxonomyFields = ["topicId", "primarySubtopicId", "taxonomyConfidence", "taxonomyRationale"];
const mergedMetadataQuestions = [];
for (const questionId of [...new Set([
  ...oursMetadata.questions.map((item) => item.questionId),
  ...Object.keys(mainMetadataById),
])]) {
  const ours = oursMetadataById[questionId];
  const main = mainMetadataById[questionId];
  if (!ours || !main) throw new Error(`Metadata ID missing from one branch: ${questionId}`);
  const merged = { ...ours };
  for (const field of taxonomyFields) merged[field] = main[field];
  const permitted = new Set(taxonomyFields);
  for (const key of new Set([...Object.keys(ours), ...Object.keys(main)])) {
    if (!permitted.has(key) && !same(ours[key], main[key])) {
      throw new Error(`Unexpected metadata conflict ${questionId}.${key}`);
    }
  }
  mergedMetadataQuestions.push(merged);
}
const reviewCounts = Object.values(mergedPracticeQuestions).reduce(
  (counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  },
  {},
);
const mergedMetadata = {
  ...oursMetadata,
  answerReview: {
    ...mainMetadata.answerReview,
    confirmed: reviewCounts.confirmed ?? 0,
    corrected: reviewCounts.corrected ?? 0,
    disputed: reviewCounts.disputed ?? 0,
    autoGradeEligible: practiceCounts.autoGradeEligible,
  },
  questions: mergedMetadataQuestions,
};

// Closure checks against the post-merge question corpus.
const questionData = JSON.parse(readFileSync(`${root}/public/data/questions.json`, "utf8"));
const questionList = Array.isArray(questionData) ? questionData : questionData.questions;
const questionIds = new Set(questionList.map((item) => item.id ?? item.questionId));
if (questionIds.size !== questionList.length) throw new Error("Duplicate IDs in questions.json");

const assertUniqueAndClosed = (label, ids) => {
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate IDs in ${label}`);
  const missing = ids.filter((id) => !questionIds.has(id));
  if (missing.length) throw new Error(`${label} contains IDs absent from questions.json: ${missing.join(", ")}`);
};
assertUniqueAndClosed("answers.json", Object.keys(mergedAnswers));
assertUniqueAndClosed("im-it-practice-status.json", Object.keys(mergedPracticeQuestions));
assertUniqueAndClosed("im-it-question-metadata.json", mergedMetadataQuestions.map((item) => item.questionId));

const imItQuestionIds = [...questionIds].filter((id) => id.startsWith("q-pp-im-it-")).sort();
for (const [label, ids] of [
  ["practice status", Object.keys(mergedPracticeQuestions).sort()],
  ["metadata", mergedMetadataQuestions.map((item) => item.questionId).sort()],
]) {
  if (!same(ids, imItQuestionIds)) throw new Error(`${label} does not exactly cover the IM-IT question set`);
}
for (const questionId of imItQuestionIds) {
  if (!mergedAnswers[questionId]) throw new Error(`Missing answer for IM-IT question: ${questionId}`);
  const metadata = mergedMetadataQuestions.find((item) => item.questionId === questionId);
  const practice = mergedPracticeQuestions[questionId];
  if (metadata.publication.autoGradeEligible !== practice.autoGradeEligible) {
    throw new Error(`Eligibility mismatch: ${questionId}`);
  }
}

writeJson(files.answers, { answers: mergedAnswers });
writeJson(files.practice, mergedPractice);
writeJson(files.metadata, mergedMetadata);
console.log(JSON.stringify({ answerDecisions, practiceCounts, reviewCounts, imItQuestions: imItQuestionIds.length }, null, 2));
