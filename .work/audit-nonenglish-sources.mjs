import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'public/data', name), 'utf8'))

const subjects = load('subjects-im.json')
const flashcards = load('flashcards.json')
const questions = load('questions.json').questions
const answers = load('answers.json').answers
const papers = load('past-papers.json').papers
const guides = load('guides.json')
const resources = load('resources.json')
const ids = ['im-it', 'im-mis', 'im-stat']

function countBy(items, key) {
  return Object.fromEntries(
    [...Map.groupBy(items, (item) => String(item[key] ?? 'missing'))]
      .map(([value, rows]) => [value, rows.length])
      .sort(([a], [b]) => a.localeCompare(b))
  )
}

const result = {}
for (const id of ids) {
  const subject = subjects.find((item) => item.id === id)
  const cards = flashcards.filter((item) => item.subjectId === id)
  const qs = questions.filter((item) => item.subjectId === id)
  const ps = papers.filter((item) => item.subjectId === id)
  const questionIds = new Set(qs.map((item) => item.id))
  const answerRows = Object.values(answers).filter((item) => questionIds.has(item.questionId))
  const repeatedPrompts = [...Map.groupBy(cards, (item) => item.prompt)].filter(
    ([, rows]) => rows.length > 1
  )
  const canonicalTopicIds = new Set(subject?.topics.map((topic) => topic.id) ?? [])
  result[id] = {
    subject: {
      name: subject?.name,
      topics: subject?.topics.length,
      subtopics: subject?.topics.reduce((sum, topic) => sum + (topic.subtopics?.length ?? 0), 0),
      topicDefinitions: subject?.topics,
      materials: subject?.materials,
    },
    flashcards: {
      count: cards.length,
      topicIds: countBy(cards, 'topicId'),
      kinds: countBy(cards, 'kind'),
      tiers: countBy(cards, 'tier'),
      withPastPaperRef: cards.filter((item) => item.pastPaperRef).length,
      repeatedPromptGroups: repeatedPrompts.length,
      validCanonicalTopicIds: cards.filter((item) => canonicalTopicIds.has(item.topicId)).length,
      invalidCanonicalTopicIds: cards.filter((item) => !canonicalTopicIds.has(item.topicId)).length,
      samples: cards.slice(0, 5),
    },
    questions: {
      count: qs.length,
      papers: countBy(qs, 'paperId'),
      years: countBy(qs, 'year'),
      withImages: qs.filter((item) => item.hasImage).length,
      withSubQuestions: qs.filter((item) => item.subQuestions?.length).length,
      answered: answerRows.length,
      answerCoverage: qs.length ? answerRows.length / qs.length : null,
      nonemptyExplanations: answerRows.filter((item) => item.explanation?.trim()).length,
      samples: qs.slice(0, 3),
    },
    pastPapers: ps,
  }
}

result.crossSubject = {
  relevantGuides: guides.filter(
    (item) => item.examRelevance?.includes('im') && /計概|資訊管理|MIS|統計/i.test(JSON.stringify(item))
  ),
  relevantResources: resources.filter(
    (item) => item.examRelevance?.includes('im') && /計概|資訊管理|MIS|統計|資管/i.test(JSON.stringify(item))
  ),
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
