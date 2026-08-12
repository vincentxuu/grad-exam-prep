/**
 * @jest-environment node
 */
import {
  lexiconCardId,
  MAX_TERM_LENGTH,
  normalizeTerm,
  personaHash,
  slugify,
} from '@/lib/lexicon/normalize'

describe('normalizeTerm', () => {
  it('收掉頭尾空白並轉小寫', () => {
    expect(normalizeTerm('  Intercept ')).toEqual({ term: 'intercept', kind: 'word' })
  })

  it('片語的內部空白收斂成單一空格，並判定為 phrase', () => {
    expect(normalizeTerm('  Take   Into Account ')).toEqual({
      term: 'take into account',
      kind: 'phrase',
    })
  })

  it('不做詞形還原 —— 屈折形保持原樣，交給模型回傳 headword', () => {
    expect(normalizeTerm('intercepted')?.term).toBe('intercepted')
    expect(normalizeTerm('studies')?.term).toBe('studies')
  })

  it('保留字中的撇號與連字號', () => {
    expect(normalizeTerm("don't")?.term).toBe("don't")
    expect(normalizeTerm('state-of-the-art')?.term).toBe('state-of-the-art')
  })

  it('彎引號與直引號正規化成同一筆快取', () => {
    expect(normalizeTerm('don’t')?.term).toBe(normalizeTerm("don't")?.term)
  })

  it('剝掉包住單字的標點（含全形括號與句號）', () => {
    expect(normalizeTerm('（intercept）')?.term).toBe('intercept')
    expect(normalizeTerm('"Intercept."')?.term).toBe('intercept')
    expect(normalizeTerm('(intercept),')?.term).toBe('intercept')
  })

  it('空字串、純標點、沒有英文字母的輸入回傳 null', () => {
    expect(normalizeTerm('')).toBeNull()
    expect(normalizeTerm('   ')).toBeNull()
    expect(normalizeTerm('。，、')).toBeNull()
    expect(normalizeTerm('123')).toBeNull()
    expect(normalizeTerm('攔截')).toBeNull()
  })

  it('過長的輸入回傳 null —— 多半是整段貼錯', () => {
    expect(normalizeTerm('a'.repeat(MAX_TERM_LENGTH))).not.toBeNull()
    expect(normalizeTerm('a'.repeat(MAX_TERM_LENGTH + 1))).toBeNull()
  })
})

describe('slugify / lexiconCardId', () => {
  it('片語用連字號串起來', () => {
    expect(slugify('take into account')).toBe('take-into-account')
  })

  it('撇號直接拿掉，不留連字號', () => {
    expect(slugify("don't")).toBe('dont')
  })

  it('卡片 id 帶 lx- 前綴，與既有靜態卡的 id 空間不衝突', () => {
    expect(lexiconCardId('intercept')).toBe('lx-intercept')
    expect(lexiconCardId('take into account')).toBe('lx-take-into-account')
  })
})

describe('personaHash', () => {
  const base = { interests: ['登山', '獨立遊戲'], work: '後端工程師', goal: '讀論文' }

  it('興趣順序不同但內容相同 → 同一個 hash（否則會白花一次生成的錢）', async () => {
    const a = await personaHash(base)
    const b = await personaHash({ ...base, interests: ['獨立遊戲', '登山'] })
    expect(a).toBe(b)
  })

  it('內容不同 → 不同 hash', async () => {
    const a = await personaHash(base)
    const b = await personaHash({ ...base, work: '前端工程師' })
    expect(a).not.toBe(b)
  })

  it('同樣輸入穩定不變', async () => {
    expect(await personaHash(base)).toBe(await personaHash(base))
  })

  it('空 persona 回傳 none，代表跳過個人化', async () => {
    expect(await personaHash(null)).toBe('none')
    expect(await personaHash(undefined)).toBe('none')
    expect(await personaHash({ interests: [], work: '' })).toBe('none')
    expect(await personaHash({ interests: ['  '], work: '  ', goal: '' })).toBe('none')
  })

  it('hash 長度固定 16', async () => {
    expect(await personaHash(base)).toHaveLength(16)
  })
})
