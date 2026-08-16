/**
 * @jest-environment node
 */
import {
  checkAndIncrementQuota,
  type Db,
  getEntry,
  getPersonal,
  putEntry,
  putPersonal,
  quotaDay,
  readQuota,
} from '@/lib/lexicon/store'
import type { LexiconEntry, PersonalBridge } from '@/types/lexicon'

/** 用 Map 撐起來的假 D1，只支援 store.ts 實際用到的那幾句 SQL。 */
function fakeDb() {
  const entries = new Map<string, { kind: string; data: string; model: string }>()
  const aliases = new Map<string, string>()
  const personal = new Map<string, string>()
  const quota = new Map<string, number>()

  const db: Db = {
    prepare(query: string) {
      const q = query.replace(/\s+/g, ' ').trim()
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              if (q.startsWith('SELECT data FROM lexicon_entries')) {
                const row = entries.get(values[0] as string)
                return row ? ({ data: row.data } as T) : null
              }
              if (q.startsWith('SELECT headword FROM lexicon_aliases')) {
                const hw = aliases.get(values[0] as string)
                return hw ? ({ headword: hw } as T) : null
              }
              if (q.startsWith('SELECT 1 AS hit FROM lexicon_entries')) {
                return entries.has(values[0] as string) ? ({ hit: 1 } as T) : null
              }
              if (q.startsWith('SELECT data FROM lexicon_personal')) {
                const data = personal.get(`${values[0]}::${values[1]}`)
                return data ? ({ data } as T) : null
              }
              if (q.startsWith('SELECT count FROM lexicon_quota')) {
                const c = quota.get(`${values[0]}::${values[1]}`)
                return c === undefined ? null : ({ count: c } as T)
              }
              throw new Error(`unhandled query: ${q}`)
            },
            async run() {
              if (q.startsWith('INSERT INTO lexicon_entries')) {
                entries.set(values[0] as string, {
                  kind: values[1] as string,
                  data: values[2] as string,
                  model: values[3] as string,
                })
                return
              }
              if (q.startsWith('INSERT INTO lexicon_aliases')) {
                const alias = values[0] as string
                if (!aliases.has(alias)) aliases.set(alias, values[1] as string)
                return
              }
              if (q.startsWith('INSERT INTO lexicon_personal')) {
                personal.set(`${values[0]}::${values[1]}`, values[2] as string)
                return
              }
              if (q.startsWith('INSERT INTO lexicon_quota')) {
                const key = `${values[0]}::${values[1]}`
                quota.set(key, (quota.get(key) ?? 0) + 1)
                return
              }
              throw new Error(`unhandled query: ${q}`)
            },
            async all<T>() {
              return { results: [] as T[] }
            },
          }
        },
      }
    },
  }

  return { db, entries, aliases, personal, quota }
}

function entry(headword: string): LexiconEntry {
  return {
    headword,
    kind: 'word',
    senses: [{ pos: 'verb', zh: '攔截', en: 'to stop and seize' }],
    collocations: [],
    phrases: [],
    confusables: [],
    synonyms: [],
    antonyms: [],
    examples: [],
  }
}

describe('getEntry / putEntry', () => {
  it('查得到剛寫入的詞條', async () => {
    const { db } = fakeDb()
    await putEntry(db, entry('intercept'), 'groq:llama-3.3-70b-versatile', 'intercept')
    expect((await getEntry(db, 'intercept'))?.headword).toBe('intercept')
  })

  it('查詢字是屈折形時建立 alias，下次直接命中', async () => {
    const { db, aliases } = fakeDb()
    await putEntry(db, entry('intercept'), 'groq:llama-3.3-70b-versatile', 'intercepted')

    expect(aliases.get('intercepted')).toBe('intercept')
    expect((await getEntry(db, 'intercepted'))?.headword).toBe('intercept')
  })

  it('查詢字等於原形時不寫多餘的 alias', async () => {
    const { db, aliases } = fakeDb()
    await putEntry(db, entry('intercept'), 'groq:llama-3.3-70b-versatile', 'intercept')
    expect(aliases.size).toBe(0)
  })

  it('查詢字本身已是另一筆詞條時，不建立會遮蔽它的 alias', async () => {
    const { db, aliases } = fakeDb()
    // left 本身是一個詞條（左邊）
    await putEntry(db, entry('left'), 'groq:llama-3.3-70b-versatile', 'left')
    // 之後有人查 left，模型把它還原成 leave 的過去式
    await putEntry(db, entry('leave'), 'groq:llama-3.3-70b-versatile', 'left')

    expect(aliases.has('left')).toBe(false)
    // 查 left 仍然拿到 left 自己，不會被導去 leave
    expect((await getEntry(db, 'left'))?.headword).toBe('left')
  })

  it('孤兒 alias 當成 cache miss，不變成查詢黑洞', async () => {
    const { db, entries } = fakeDb()
    await putEntry(db, entry('intercept'), 'groq:llama-3.3-70b-versatile', 'intercepted')
    entries.delete('intercept')

    expect(await getEntry(db, 'intercepted')).toBeNull()
  })

  it('查不到的詞回傳 null', async () => {
    const { db } = fakeDb()
    expect(await getEntry(db, 'nonexistent')).toBeNull()
  })

  it('讀取舊快取時也會把簡體內容正規化成臺灣繁體', async () => {
    const { db, entries } = fakeDb()
    entries.set('software', {
      kind: 'word',
      model: 'legacy',
      data: JSON.stringify({
        ...entry('software'),
        senses: [{ pos: 'noun', zh: '软件与数据库', en: 'software and databases' }],
      }),
    })

    expect((await getEntry(db, 'software'))?.senses[0].zh).toBe('軟體與資料庫')
  })
})

describe('個人化橋接', () => {
  const bridge: PersonalBridge = {
    headword: 'intercept',
    examples: [{ en: 'We intercepted the request.', zh: '我們攔截了那個請求。' }],
    mnemonic: '像 middleware 攔下請求',
  }

  it('依 persona hash 分開存取', async () => {
    const { db } = fakeDb()
    await putPersonal(db, bridge, 'hash-a')

    expect((await getPersonal(db, 'intercept', 'hash-a'))?.mnemonic).toBe(bridge.mnemonic)
    expect(await getPersonal(db, 'intercept', 'hash-b')).toBeNull()
  })
})

describe('配額', () => {
  const DAY = Date.UTC(2026, 7, 12)

  it('quotaDay 用 UTC，換裝置不會換一天', () => {
    expect(quotaDay(Date.UTC(2026, 7, 12, 23, 59))).toBe('2026-08-12')
  })

  it('遞增到上限後擋下', async () => {
    const { db } = fakeDb()
    for (let i = 0; i < 3; i++) {
      const r = await checkAndIncrementQuota(db, 'u1', 3, DAY)
      expect(r.allowed).toBe(true)
      expect(r.used).toBe(i + 1)
    }

    const blocked = await checkAndIncrementQuota(db, 'u1', 3, DAY)
    expect(blocked.allowed).toBe(false)
    expect(blocked.used).toBe(3)
  })

  it('達上限後不再遞增 —— 被擋的請求不該繼續累加', async () => {
    const { db, quota } = fakeDb()
    await checkAndIncrementQuota(db, 'u1', 1, DAY)
    await checkAndIncrementQuota(db, 'u1', 1, DAY)
    await checkAndIncrementQuota(db, 'u1', 1, DAY)

    expect(quota.get(`u1::${quotaDay(DAY)}`)).toBe(1)
  })

  it('不同使用者、不同日期各自計算', async () => {
    const { db } = fakeDb()
    await checkAndIncrementQuota(db, 'u1', 5, DAY)

    expect((await readQuota(db, 'u2', 5, DAY)).used).toBe(0)
    expect((await readQuota(db, 'u1', 5, DAY + 86400_000)).used).toBe(0)
  })

  it('readQuota 不遞增', async () => {
    const { db } = fakeDb()
    await readQuota(db, 'u1', 5, DAY)
    await readQuota(db, 'u1', 5, DAY)
    expect((await readQuota(db, 'u1', 5, DAY)).used).toBe(0)
  })
})
