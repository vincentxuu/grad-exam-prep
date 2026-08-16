import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'public', 'data')

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))
}

function topicForSubtopic(master, subtopicId) {
  const topic = master.topics.find((candidate) =>
    candidate.subtopics.some((subtopic) => subtopic.id === subtopicId)
  )
  if (!topic) throw new Error(`No canonical topic owns ${subtopicId}`)
  return topic.id
}

function answerWithProvenance(answer, explanation, sourceRefs) {
  const detail = explanation?.trim() ? `\n\n${explanation.trim()}` : ''
  return `${answer.trim()}${detail}\n\n【來源】${sourceRefs.join('、')}`
}

function buildMisCards() {
  const candidates = read('im-mis-srs-candidates.json')
  const master = read('im-mis-concept-master.json')
  if (candidates.candidates.length !== 48) throw new Error('IM-MIS SRS count drifted from 48')

  return candidates.candidates.map((candidate) => {
    if (candidate.reviewStatus !== 'reviewed' || candidate.sourceRefs.length === 0) {
      throw new Error(`${candidate.id} is not a reviewed, sourced SRS candidate`)
    }
    return {
      id: candidate.id.replace('srs-candidate-', 'fc-'),
      examId: 'im',
      subjectId: 'im-mis',
      topicId: topicForSubtopic(master, candidate.subtopicId),
      prompt: candidate.front,
      answer: answerWithProvenance(candidate.back, candidate.explanation, candidate.sourceRefs),
      ...(candidate.pastPaperRefs[0] ? { pastPaperRef: candidate.pastPaperRefs[0] } : {}),
    }
  })
}

function buildStatCards() {
  const candidates = read('im-stat-srs-candidates.json')
  const conceptCards = read('im-stat-concept-cards.json').cards
  const conceptCardsById = new Map(conceptCards.map((card) => [card.id, card]))
  const master = read('im-stat-concept-master.json')
  if (candidates.candidates.length !== 18) throw new Error('IM-STAT SRS count drifted from 18')

  return candidates.candidates.map((candidate) => {
    const conceptCard = conceptCardsById.get(candidate.conceptCardId)
    if (candidate.status !== 'reviewed_candidate' || !conceptCard) {
      throw new Error(`${candidate.id} is not backed by a reviewed concept card`)
    }
    if (candidate.sourceRefs.length === 0 || conceptCard.reviewStatus !== 'reviewed') {
      throw new Error(`${candidate.id} is missing reviewed source provenance`)
    }
    return {
      id: `fc-im-stat-${candidate.conceptCardId.replace('card-im-stat-', '')}`,
      examId: 'im',
      subjectId: 'im-stat',
      topicId: topicForSubtopic(master, candidate.subtopicId),
      prompt: candidate.prompt,
      answer: answerWithProvenance(candidate.answer, conceptCard.explanation, candidate.sourceRefs),
      ...(candidate.pastPaperRefs[0] ? { pastPaperRef: candidate.pastPaperRefs[0] } : {}),
    }
  })
}

const existing = read('flashcards.json')
const retained = existing.filter(
  (card) => card.subjectId !== 'im-mis' && card.subjectId !== 'im-stat'
)
const curated = [...buildMisCards(), ...buildStatCards()]
const ids = curated.map((card) => card.id)
const prompts = curated.map((card) => `${card.subjectId}:${card.prompt.trim().toLowerCase()}`)
if (new Set(ids).size !== ids.length) throw new Error('Duplicate curated IM SRS IDs')
if (new Set(prompts).size !== prompts.length) throw new Error('Duplicate curated IM SRS prompts')

const outputPath = path.join(dataDir, 'flashcards.json')
const rendered = `${JSON.stringify([...retained, ...curated], null, 2)}\n`
if (process.argv.includes('--check')) {
  if (fs.readFileSync(outputPath, 'utf8') !== rendered) {
    throw new Error('Curated IM SRS publication drifted from its source candidates')
  }
  process.stdout.write(`Verified ${curated.length} curated IM SRS cards.\n`)
  process.exit(0)
}

fs.writeFileSync(outputPath, rendered)

console.log(
  `Published ${curated.length} curated IM SRS cards (${buildMisCards().length} MIS, ${buildStatCards().length} STAT).`
)
