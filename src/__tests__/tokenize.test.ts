/**
 * @jest-environment node
 */
import { sentenceAt, tokenize } from '@/lib/reading/tokenize'

describe('tokenize', () => {
  it('把 token 接回去等於原文 —— 版面不會因為切詞而跑掉', () => {
    const text =
      'The team managed to intercept the message, but it was too late.\n\nNext paragraph.'
    expect(
      tokenize(text)
        .map((t) => t.text)
        .join('')
    ).toBe(text)
  })

  it('offset 對得上原文', () => {
    const text = 'We intercept requests.'
    for (const t of tokenize(text)) {
      expect(text.slice(t.start, t.end)).toBe(t.text)
    }
  })

  it('撇號與連字號留在同一個字裡', () => {
    const words = tokenize("don't use state-of-the-art tools")
      .filter((t) => t.isWord)
      .map((t) => t.text)
    expect(words).toEqual(["don't", 'use', 'state-of-the-art', 'tools'])
  })

  it('標點與空白是 isWord: false 的 token', () => {
    const tokens = tokenize('Hi, there.')
    expect(tokens.filter((t) => t.isWord).map((t) => t.text)).toEqual(['Hi', 'there'])
    expect(tokens.filter((t) => !t.isWord).map((t) => t.text)).toEqual([', ', '.'])
  })

  it('中文不會被切成可點的字', () => {
    expect(
      tokenize('攔截 intercept 訊息')
        .filter((t) => t.isWord)
        .map((t) => t.text)
    ).toEqual(['intercept'])
  })

  it('空字串回傳空陣列', () => {
    expect(tokenize('')).toEqual([])
  })

  it('純標點不會產生 word token', () => {
    expect(tokenize('...').filter((t) => t.isWord)).toHaveLength(0)
  })
})

describe('sentenceAt', () => {
  const text =
    'The first sentence is here. The team managed to intercept the message. A third one follows!'

  it('取出包含該範圍的整句', () => {
    const i = text.indexOf('intercept')
    expect(sentenceAt(text, i, i + 'intercept'.length)).toBe(
      'The team managed to intercept the message.'
    )
  })

  it('第一句沒有前置邊界也能取', () => {
    const i = text.indexOf('first')
    expect(sentenceAt(text, i, i + 5)).toBe('The first sentence is here.')
  })

  it('最後一句取到結尾', () => {
    const i = text.indexOf('third')
    expect(sentenceAt(text, i, i + 5)).toBe('A third one follows!')
  })

  it('換行也是句子邊界', () => {
    const t = 'Line one has intercept\nLine two is separate.'
    const i = t.indexOf('intercept')
    expect(sentenceAt(t, i, i + 9)).toBe('Line one has intercept')
  })

  it('單句文字整段回傳', () => {
    const t = 'Just one clause with no terminator'
    expect(sentenceAt(t, 5, 8)).toBe(t)
  })
})
