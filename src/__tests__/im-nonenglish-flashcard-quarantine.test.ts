const flashcards = require('../../public/data/flashcards.json')
const archive = require('../../archive/flashcards/im-nonenglish-legacy.json')
const questions = require('../../public/data/questions.json').questions

export {}

interface ContentItem {
  id: string
  subjectId: string
  prompt?: string
  answer?: string
}

const subjectCounts = {
  'im-it': 60,
  'im-mis': 50,
  'im-stat': 50,
} as const

describe('non-English IM flashcard quarantine', () => {
  test('keeps legacy cards out of the production flashcard artifact', () => {
    const quarantinedSubjects = new Set(Object.keys(subjectCounts))
    const leaked = (flashcards as ContentItem[]).filter((card) =>
      quarantinedSubjects.has(card.subjectId)
    )

    expect(leaked).toEqual([])
  })

  test('preserves every removed card in the non-public archive', () => {
    const cards = archive.cards as ContentItem[]
    const ids = cards.map((card) => card.id)

    expect(cards).toHaveLength(160)
    expect(new Set(ids).size).toBe(cards.length)
    expect(archive.reason).toContain('concept-master provenance')

    for (const [subjectId, count] of Object.entries(subjectCounts)) {
      expect(cards.filter((card) => card.subjectId === subjectId)).toHaveLength(count)
    }
    for (const card of cards) {
      expect(card.prompt?.trim()).toBeTruthy()
      expect(card.answer?.trim()).toBeTruthy()
    }
  })

  test('does not remove or convert the audited past-paper question bank', () => {
    for (const [subjectId, count] of Object.entries({
      'im-it': 260,
      'im-mis': 37,
      'im-stat': 5,
    })) {
      expect(
        (questions as ContentItem[]).filter((item) => item.subjectId === subjectId)
      ).toHaveLength(count)
    }
  })
})
