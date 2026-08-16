/**
 * @jest-environment node
 */
// `chat/env.ts` 會 import `@opennextjs/cloudflare`（純 ESM，jest 這邊沒轉譯）。
// 這裡測的是不碰 Workers context 的純函式，把整包擋掉就好。
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }))

import { type ChatEnv, chatQuotaLimit, DEFAULT_CHAT_QUOTA } from '@/lib/chat/env'
import type { Db } from '@/lib/lexicon/store'
import { clearConfigCache, loadConfig, saveConfig } from '@/lib/llm/config'
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  hasCredentials,
  type LlmEnv,
  type ModelProvider,
  resolveFallbackRoute,
  resolveRoute,
} from '@/lib/llm/model'

interface Row {
  provider: string | null
  model: string | null
  fallback_provider: string | null
  fallback_model: string | null
  lexicon_quota: number | null
  chat_quota: number | null
}

/**
 * 假 D1，只認 config.ts 實際下的那兩句。`missing` 用來模擬 migration
 * 還沒跑 —— D1 在表不存在時會丟，不是回 null。
 */
function fakeDb(opts: { missing?: boolean } = {}) {
  let row: Row | null = null
  let selects = 0

  const db: Db = {
    prepare(query: string) {
      const q = query.replace(/\s+/g, ' ').trim()
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              if (q.startsWith('SELECT provider, model')) {
                if (opts.missing) throw new Error('no such table: llm_config')
                selects++
                return row as T | null
              }
              throw new Error(`unhandled query: ${q}`)
            },
            async run() {
              if (q.startsWith('INSERT INTO llm_config')) {
                row = {
                  provider: values[0] as string | null,
                  model: values[1] as string | null,
                  fallback_provider: values[2] as string | null,
                  fallback_model: values[3] as string | null,
                  lexicon_quota: values[4] as number | null,
                  chat_quota: values[5] as number | null,
                }
                return
              }
              throw new Error(`unhandled query: ${q}`)
            },
          }
        },
      }
    },
  } as unknown as Db

  return { db, selects: () => selects }
}

beforeEach(clearConfigCache)

describe('loadConfig', () => {
  it('表是空的就回空設定', async () => {
    const { db } = fakeDb()
    expect(await loadConfig(db)).toEqual({})
  })

  it('讀得回寫進去的設定', async () => {
    const { db } = fakeDb()
    await saveConfig(db, { provider: 'google', model: 'gemini-2.0-flash', chatQuota: 15 })

    expect(await loadConfig(db)).toEqual({
      provider: 'google',
      model: 'gemini-2.0-flash',
      fallbackProvider: undefined,
      fallbackModel: undefined,
      lexiconQuota: undefined,
      chatQuota: 15,
    })
  })

  it('空字串與非正數的額度都當作沒設定', async () => {
    const { db } = fakeDb()
    await saveConfig(db, { provider: '   ', model: '', chatQuota: 0, lexiconQuota: -5 })

    const config = await loadConfig(db)
    expect(config.provider).toBeUndefined()
    expect(config.model).toBeUndefined()
    expect(config.chatQuota).toBeUndefined()
    expect(config.lexiconQuota).toBeUndefined()
  })

  it('表還沒建就安靜地回空設定，不要讓查詞整個掛掉', async () => {
    const { db } = fakeDb({ missing: true })
    expect(await loadConfig(db)).toEqual({})
  })

  it('TTL 內只打一次 D1，過期後重讀', async () => {
    const { db, selects } = fakeDb()

    await loadConfig(db, 1_000)
    await loadConfig(db, 30_000)
    expect(selects()).toBe(1)

    await loadConfig(db, 100_000)
    expect(selects()).toBe(2)
  })

  it('存檔會清掉快取，不用等 TTL 到期', async () => {
    const { db } = fakeDb()
    await loadConfig(db, 1_000)

    await saveConfig(db, { model: 'llama-3.1-8b-instant' })
    expect((await loadConfig(db, 1_001)).model).toBe('llama-3.1-8b-instant')
  })
})

describe('resolveRoute 的優先序', () => {
  const env: LlmEnv = { LLM_PROVIDER: 'openai', LLM_MODEL: 'gpt-4o-mini' }

  it('設定表最大', () => {
    expect(resolveRoute(env, { provider: 'google', model: 'gemini-2.0-flash' })).toEqual({
      provider: 'google',
      model: 'gemini-2.0-flash',
      fallback: false,
    })
  })

  it('設定表沒有就用 env', () => {
    expect(resolveRoute(env, {})).toEqual({
      provider: 'openai',
      model: 'gpt-4o-mini',
      fallback: false,
    })
  })

  it('兩邊都沒有才用程式預設', () => {
    expect(resolveRoute({})).toEqual({
      provider: DEFAULT_PROVIDER,
      model: DEFAULT_MODEL,
      fallback: false,
    })
  })

  it('每個欄位各自獨立 —— 只覆蓋 model 不會連 provider 一起換掉', () => {
    expect(resolveRoute(env, { model: 'gpt-4o' })).toEqual({
      provider: 'openai',
      model: 'gpt-4o',
      fallback: false,
    })
  })

  it('認不得的 provider 當作沒設定，往下一層找', () => {
    expect(resolveRoute(env, { provider: 'deepseek' }).provider).toBe('openai')
    expect(resolveRoute({ LLM_PROVIDER: 'deepseek' }).provider).toBe(DEFAULT_PROVIDER)
  })

  it('cloudflare 認得', () => {
    expect(resolveRoute({}, { provider: 'cloudflare' }).provider).toBe('cloudflare')
  })
})

describe('resolveFallbackRoute', () => {
  it('沒設定 fallback provider 就不退', () => {
    expect(resolveFallbackRoute({}, {})).toBeNull()
    expect(resolveFallbackRoute({ LLM_FALLBACK_MODEL: 'gpt-4o' }, {})).toBeNull()
  })

  it('設定表的 fallback 蓋過 env，且標記 fallback 避免無限退', () => {
    const env: LlmEnv = { LLM_FALLBACK_PROVIDER: 'openai', LLM_FALLBACK_MODEL: 'gpt-4o-mini' }

    expect(resolveFallbackRoute(env, { fallbackProvider: 'google' })).toEqual({
      provider: 'google',
      model: 'gpt-4o-mini',
      fallback: true,
    })
  })
})

describe('hasCredentials', () => {
  const route = (provider: ModelProvider) => ({ provider, model: 'x', fallback: false })

  it.each<[ModelProvider, LlmEnv]>([
    ['groq', { GROQ_API_KEY: 'k' }],
    ['google', { GOOGLE_API_KEY: 'k' }],
    ['google', { GEMINI_API_KEY: 'k' }],
    ['openai', { OPENAI_API_KEY: 'k' }],
    ['openrouter', { OPENROUTER_API_KEY: 'k' }],
    ['cerebras', { CEREBRAS_API_KEY: 'k' }],
  ])('%s 有 key 就算設定好', (provider, env) => {
    expect(hasCredentials(env, route(provider))).toBe(true)
    expect(hasCredentials({}, route(provider))).toBe(false)
  })

  it('ollama 是本機端點，不需要 key', () => {
    expect(hasCredentials({}, route('ollama'))).toBe(true)
  })

  it('cloudflare 直接檢查 Workers AI binding，不需要 token', () => {
    expect(hasCredentials({}, route('cloudflare'))).toBe(false)
    expect(hasCredentials({ AI: {} as Ai }, route('cloudflare'))).toBe(true)
  })
})

describe('chatQuotaLimit 的優先序', () => {
  const env = { CHAT_DAILY_QUOTA: '25' } as ChatEnv

  it('設定表最大', () => {
    expect(chatQuotaLimit(env, { chatQuota: 5 })).toBe(5)
  })

  it('設定表沒有就用 env', () => {
    expect(chatQuotaLimit(env, {})).toBe(25)
  })

  it('兩邊都沒有才用程式預設', () => {
    expect(chatQuotaLimit({} as ChatEnv)).toBe(DEFAULT_CHAT_QUOTA)
  })
})
