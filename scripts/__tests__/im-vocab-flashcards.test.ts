const {
  buildVocabularyAnswer,
  createDirectVocabularyCard,
  findAuthenticExample,
  inferPartsOfSpeech,
  isRequiredVocabulary,
  sentenceCandidates,
  slugifyVocabulary,
} = require('../lib/im-vocab-flashcards')

export {}

const entry = {
  word: 'resilience',
  chinese: '韌性；恢復力',
  pos: 'n',
  tier: 'must_know',
  source: 'english-exam',
  englishExam: { years: [112, 114] },
}

describe('IM direct vocabulary flashcards', () => {
  test('uses the four target tiers as the required vocabulary contract', () => {
    expect(isRequiredVocabulary({ tier: 'must_know' })).toBe(true)
    expect(isRequiredVocabulary({ tier: 'important' })).toBe(true)
    expect(isRequiredVocabulary({ tier: 'worth_studying' })).toBe(true)
    expect(isRequiredVocabulary({ tier: 'domain' })).toBe(true)
    expect(isRequiredVocabulary({ tier: 'gre_extra' })).toBe(false)
    expect(isRequiredVocabulary({ tier: 'skip' })).toBe(false)
  })

  test('creates stable ids for words and phrases', () => {
    expect(slugifyVocabulary("author's")).toBe('authors')
    expect(slugifyVocabulary('take into account')).toBe('take-into-account')
  })

  test('infers parts of speech from dictionary definitions', () => {
    expect(
      inferPartsOfSpeech(
        { pos: '' },
        { definition: 'n. recovery after difficulty\nadj. able to recover' }
      )
    ).toEqual(['noun', 'adjective'])
  })

  test('builds an explanation back without multiple-choice options', () => {
    const answer = buildVocabularyAnswer({
      entry,
      lexicon: { definition: 'n. the ability to recover', translation: 'n. 恢復力' },
      example: {
        en: 'The team showed resilience after the setback.',
        zh: '團隊在挫折後展現韌性。',
      },
    })

    expect(answer).toContain('【意思】韌性；恢復力')
    expect(answer).toContain('【詞性】n')
    expect(answer).toContain('【英文解釋】n. the ability to recover')
    expect(answer).toContain('【例句】The team showed resilience after the setback.')
    expect(answer).not.toMatch(/\(A\)|\(B\)|\(C\)|\(D\)/)
  })

  test('uses the headword alone on the front of a generated card', () => {
    const card = createDirectVocabularyCard({
      entry,
      lexicon: { definition: 'n. the ability to recover' },
    })

    expect(card).toMatchObject({
      id: 'fc-im-vocab-resilience',
      topicId: 'im-en-vocab',
      kind: 'vocabulary',
      headword: 'resilience',
      prompt: 'resilience',
    })
  })

  test('extracts a complete authentic sentence without options or blanks', () => {
    const candidates = sentenceCandidates([
      {
        paperId: 'pp-im-en-112',
        year: 112,
        number: 7,
        text: 'The community showed remarkable resilience after the storm.\n(A) weak (B) strong',
      },
    ])

    expect(findAuthenticExample('resilience', candidates)).toEqual({
      text: 'The community showed remarkable resilience after the storm.',
      en: 'The community showed remarkable resilience after the storm.',
      paperId: 'pp-im-en-112',
      year: 112,
      number: 7,
    })
  })
})
