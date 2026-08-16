const {
  findLowQualityFlashcardIds,
  findPlaceholderExampleCards,
  groupRepeatedEnglishClozeStems,
  isEnglishClozeStem,
  normalizePromptStem,
} = require('../lib/flashcard-quality')

function card(id: string, prompt: string, answer = '【意思】測試') {
  return { id, subjectId: 'im-english', prompt, answer }
}

describe('flashcard quality checks', () => {
  test('normalizes only the first prompt paragraph', () => {
    expect(normalizePromptStem('  A   _____  sentence.\n\n(A) one  (B) two')).toBe(
      'A _____ sentence.'
    )
  })

  test('normalizes compatibility-width characters before grouping', () => {
    expect(normalizePromptStem('Ｔｈｅ _____ result.')).toBe('The _____ result.')
  })

  test('only treats ASCII English fill-in sentences as English cloze stems', () => {
    expect(isEnglishClozeStem('A _____ sentence.')).toBe(true)
    expect(isEnglishClozeStem('克漏字：選出最適合填入 _____ 的詞彙。')).toBe(false)
    expect(isEnglishClozeStem('Explain this vocabulary word.')).toBe(false)
  })

  test('flags an English cloze stem only after it exceeds the limit', () => {
    const prompt = 'The report described the situation as _____ today.'
    const cards = Array.from({ length: 6 }, (_, index) => card(`card-${index}`, prompt))

    expect(groupRepeatedEnglishClozeStems(cards)).toHaveLength(1)
    expect(groupRepeatedEnglishClozeStems(cards)[0].cards).toHaveLength(6)
    expect(groupRepeatedEnglishClozeStems(cards.slice(0, 5))).toHaveLength(0)
  })

  test('groups repeated stems within a subject rather than across subjects', () => {
    const prompt = 'The report described the situation as _____ today.'
    const imCards = Array.from({ length: 4 }, (_, index) => card(`im-${index}`, prompt))
    const csCards = Array.from({ length: 4 }, (_, index) => ({
      ...card(`cs-${index}`, prompt),
      subjectId: 'cs-english',
    }))

    expect(groupRepeatedEnglishClozeStems([...imCards, ...csCards])).toHaveLength(0)
  })

  test('does not mistake a shared instruction paragraph for the cloze stem', () => {
    const prompt = '克漏字：選出最適合填入空格的詞彙。\n\nThe result was _____.'
    const cards = Array.from({ length: 9 }, (_, index) => card(`curated-${index}`, prompt))

    expect(groupRepeatedEnglishClozeStems(cards)).toHaveLength(0)
  })

  test('flags placeholder examples independently of stem repetition', () => {
    const placeholder = card(
      'placeholder',
      'abscond（動詞）',
      '【例句】This is an example of abscond in academic context.'
    )

    expect(findPlaceholderExampleCards([placeholder])).toEqual([placeholder])
    expect(findLowQualityFlashcardIds([placeholder])).toEqual(new Set(['placeholder']))
  })

  test('does not flag the placeholder phrase outside a labeled example line', () => {
    const explanation = card(
      'explanation',
      'abscond（動詞）',
      'Avoid writing: This is an example of abscond in academic context.'
    )

    expect(findPlaceholderExampleCards([explanation])).toHaveLength(0)
  })
})
