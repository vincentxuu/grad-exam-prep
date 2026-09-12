import flashcardsRaw from '../../public/data/flashcards.json'
import misMasterRaw from '../../public/data/im-mis-concept-master.json'
import misSourcesRaw from '../../public/data/im-mis-source-registry.json'
import statMasterRaw from '../../public/data/im-stat-concept-master.json'
import statSourcesRaw from '../../public/data/im-stat-source-registry.json'

interface Card {
  id: string
  subjectId: string
  topicId: string
  prompt: string
  answer: string
}

function sourceIds(value: unknown) {
  if (Array.isArray(value)) return new Set(value.map((source) => source.id as string))
  const sources = (value as { sources: { id: string }[] }).sources
  return new Set(sources.map((source) => source.id))
}

describe('curated IM SRS publication', () => {
  const cards = flashcardsRaw as Card[]

  test.each([
    ['im-mis', 48, misMasterRaw, misSourcesRaw],
    ['im-stat', 18, statMasterRaw, statSourcesRaw],
  ] as const)('%s cards close over canonical topics and reviewed sources', (subjectId, count, master, registry) => {
    const subjectCards = cards.filter((card) => card.subjectId === subjectId)
    const topics = new Set(master.topics.map((topic) => topic.id))
    const sources = sourceIds(registry)

    expect(subjectCards).toHaveLength(count)
    expect(new Set(subjectCards.map((card) => card.id)).size).toBe(count)
    expect(new Set(subjectCards.map((card) => card.prompt.trim().toLowerCase())).size).toBe(count)

    for (const card of subjectCards) {
      expect(topics.has(card.topicId)).toBe(true)
      const marker = card.answer.split('【來源】')[1]
      expect(marker).toBeTruthy()
      for (const sourceId of marker.split('、')) {
        expect(sources.has(sourceId.trim())).toBe(true)
      }
    }
  })
})
