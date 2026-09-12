import { readFileSync } from 'node:fs';

const root = new URL('../public/data/', import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
const master = read('im-it-concept-master.json');
const metadata = read('im-it-question-metadata.json');
const review = read('im-it-answer-review.json');
const sources = read('im-it-source-registry.json');
const lessons = read('im-it-lessons.json');
const cards = read('im-it-concept-cards.json');

const targets = [
  'im-it-arch-number-systems',
  'im-it-arch-boolean-logic',
  'im-it-arch-digital-circuits',
  'im-it-arch-io-performance',
  'im-it-prog-syntax-types-control',
  'im-it-prog-functions-scope',
  'im-it-prog-pointers-memory',
  'im-it-prog-language-runtime',
  'im-it-prog-error-testing',
  'im-it-prog-software-lifecycle',
];

const eligible = new Set(
  review.questions
    .filter((question) => question.practiceEligible && question.autoGradeEligible)
    .map((question) => question.questionId),
);
const sourceById = new Map(sources.sources.map((source) => [source.id, source]));
const audit = targets.map((subtopicId) => {
  const topic = master.topics.find((entry) =>
    entry.subtopics.some((subtopic) => subtopic.id === subtopicId),
  );
  const subtopic = topic.subtopics.find((entry) => entry.id === subtopicId);
  const questions = metadata.questions.filter(
    (question) => question.primarySubtopicId === subtopicId,
  );
  return {
    subtopicId,
    title: subtopic.title,
    allRefs: questions.map((question) => question.questionId),
    eligibleRefs: questions
      .map((question) => question.questionId)
      .filter((questionId) => eligible.has(questionId)),
    questionDetails: questions.map((question) => ({
      questionId: question.questionId,
      eligible: eligible.has(question.questionId),
      rationale: question.taxonomyRationale,
      confidence: question.answerConfidence,
    })),
  };
});

console.log(JSON.stringify({
  targets: audit,
  sourceCount: sources.sources.length,
  reviewedSources: sources.sources.filter((source) => source.reviewStatus === 'reviewed'),
  existingLessonSamples: lessons.lessons.slice(0, 3),
  existingCardSamples: cards.cards.slice(0, 6),
  sourceById: Object.fromEntries(sourceById),
}, null, 2));
