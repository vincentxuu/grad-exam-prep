import { resources, resourceYear } from '@/lib/content'

describe('resourceYear', () => {
  it('抓出標題開頭或中間的民國年', () => {
    expect(resourceYear('Dcard — 115台大資管所正取考研心得')).toBe('115')
    expect(resourceYear('PTT — 113 資管所考試心得')).toBe('113')
    expect(resourceYear('108 年資管所計概試題＋解答（台大／政大／中央／成大／中山）')).toBe('108')
  })

  it('沒有年度屬性的資源回傳 null', () => {
    expect(resourceYear('Brookshear《Computer Science: An Overview》')).toBeNull()
    expect(resourceYear('台大圖書館歷屆考古題')).toBeNull()
    expect(resourceYear('iThome — 資訊科技時事')).toBeNull()
  })

  it('不把四位數年份誤判成民國年', () => {
    expect(resourceYear('Medium — 2020 資管所推甄＆考試分享')).toBeNull()
  })
})

describe('resources 資料完整性', () => {
  it('id 與 url 皆不重複', () => {
    const ids = resources.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    const urls = resources.map((r) => r.url).filter(Boolean)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('每筆都至少掛一個考試別', () => {
    for (const r of resources) {
      expect(r.examRelevance.length).toBeGreaterThan(0)
    }
  })
})
