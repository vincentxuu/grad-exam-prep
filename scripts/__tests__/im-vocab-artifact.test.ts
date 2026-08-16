const flashcards = require('../../public/data/flashcards.json')
const master = require('../../public/data/ntu-im-vocab-master.json')
const curation = require('../../public/data/im-vocab-curation.json')
const {
  isRequiredVocabulary: artifactIsRequiredVocabulary,
  slugifyVocabulary: artifactSlugifyVocabulary,
} = require('../lib/im-vocab-flashcards')

export {}

interface ArtifactCard {
  id: string
  subjectId: string
  topicId: string
  kind?: string
  headword?: string
  tier?: string
  prompt: string
  answer: string
}

describe('checked-in IM vocabulary artifact', () => {
  test('covers every curated target exactly once with a direct front and substantive back', () => {
    const excluded = new Set(curation.excluded.map((entry: { word: string }) => entry.word))
    const expected = master.words.filter(
      (entry: { word: string; tier: string }) =>
        artifactIsRequiredVocabulary(entry) && !excluded.has(entry.word)
    )
    const cards = (flashcards as ArtifactCard[]).filter((card) => card.subjectId === 'im-english')
    const byId = new Map(cards.map((card) => [card.id, card]))

    expect(cards).toHaveLength(expected.length)
    expect(byId.size).toBe(cards.length)

    for (const entry of expected) {
      const card = byId.get(`fc-im-vocab-${artifactSlugifyVocabulary(entry.word)}`)
      expect(card).toBeDefined()
      if (!card) throw new Error(`Missing generated card for ${entry.word}`)
      expect(card).toMatchObject({
        kind: 'vocabulary',
        topicId: 'im-en-vocab',
        tier: entry.tier,
        prompt: card.headword,
      })
      expect(card.prompt).not.toMatch(/_{3,}|\([A-Ea-e]\)/)
      expect(card.answer).toContain('【意思】')
      expect(card.answer).toContain('【來源】')
      expect(
        ['【詞性】', '【英文解釋】', '【例句】'].some((marker) => card.answer.includes(marker))
      ).toBe(true)
    }
  })

  test('covers vocabulary restored with the 111-year passages using canonical headwords', () => {
    const restoredHeadwords = [
      'prompt',
      'plausibly',
      'press release',
      'frightening',
      'hilarious',
      'self-deprecating',
      'undercut',
      'lob',
      'launch',
    ]
    const cards = (flashcards as ArtifactCard[]).filter((card) => card.subjectId === 'im-english')
    const byHeadword = new Map(cards.map((card) => [card.headword, card]))

    for (const headword of restoredHeadwords) {
      const card = byHeadword.get(headword)
      expect(card).toBeDefined()
      expect(card?.tier).toBe('worth_studying')
      expect(card?.answer).toContain('【例句】')
      expect(card?.answer).toContain('111')
    }

    expect(byHeadword.has('undercuts')).toBe(false)
    expect(byHeadword.has('lobbed')).toBe(false)
    expect(byHeadword.has('press releases')).toBe(false)
  })
})
