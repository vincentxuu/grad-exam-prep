import fs from 'node:fs'

const read = (name) => JSON.parse(fs.readFileSync(`public/data/${name}`, 'utf8'))
const subjects = read('subjects-im.json')
const questions = read('questions.json').questions
const answers = read('answers.json').answers
const papers = read('past-papers.json').papers
const cards = read('flashcards.json')

const targetIds = ['im-it', 'im-mis', 'im-stat']
const result = {}

for (const subjectId of targetIds) {
  const subject = subjects.find((item) => item.id === subjectId)
  const subjectCards = cards.filter((item) => item.subjectId === subjectId)
  const subjectQuestions = questions.filter((item) => item.subjectId === subjectId)
  const subjectPapers = papers.filter((item) => item.subjectId === subjectId)
  const unreliableIds = new Set(
    subjectPapers.filter((item) => item.contentStatus).map((item) => item.id),
  )
  const reliableQuestions = subjectQuestions.filter((item) => !unreliableIds.has(item.paperId))
  const explained = reliableQuestions.filter(
    (item) => typeof answers[item.id]?.explanation === 'string' && answers[item.id].explanation.length >= 80,
  )
  const topicCounts = Object.fromEntries(
    subject.topics.map((topic) => [
      topic.id,
      subjectCards.filter((item) => item.topicId === topic.id).length,
    ]),
  )
  const promptCounts = new Map()
  for (const card of subjectCards) {
    const normalized = card.prompt.trim().toLowerCase().replace(/\s+/g, ' ')
    promptCounts.set(normalized, (promptCounts.get(normalized) ?? 0) + 1)
  }

  result[subjectId] = {
    topics: subject.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      importance: topic.importance,
      subtopics: topic.subtopics,
    })),
    cards: subjectCards.length,
    topicCounts,
    duplicatePrompts: [...promptCounts.values()].filter((count) => count > 1).length,
    cardSamples: subjectCards.slice(0, 6).map(({ id, topicId, prompt, answer, pastPaperRef }) => ({
      id,
      topicId,
      prompt,
      answer: answer.slice(0, 260),
      pastPaperRef,
    })),
    papers: subjectPapers.length,
    verifiedPapers: subjectPapers.filter((item) => item.verified).length,
    unreliablePapers: [...unreliableIds],
    questions: subjectQuestions.length,
    reliableQuestions: reliableQuestions.length,
    reliableQuestionsWithExplanation: explained.length,
    years: [...new Set(subjectQuestions.map((item) => item.year))].sort(),
    questionSamples: reliableQuestions.slice(0, 4).map((item) => ({
      id: item.id,
      year: item.year,
      text: item.text.slice(0, 320),
      explanation: answers[item.id]?.explanation?.slice(0, 320) ?? null,
    })),
  }
}

console.log(JSON.stringify(result, null, 2))
