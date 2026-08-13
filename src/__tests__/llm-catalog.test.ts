/**
 * @jest-environment node
 */
import { asProvider, type ModelProvider, PROVIDER_CATALOG, providerInfo } from '@/lib/llm/catalog'
import { pingRoute } from '@/lib/llm/invoke'
import { createModel, DEFAULT_PROVIDER, type LlmEnv } from '@/lib/llm/model'

describe('PROVIDER_CATALOG', () => {
  it('id 不重複', () => {
    const ids = PROVIDER_CATALOG.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每一家都給得出 label 與範例 model', () => {
    for (const p of PROVIDER_CATALOG) {
      expect(p.label).toBeTruthy()
      expect(p.sampleModel).toBeTruthy()
    }
  })

  it('預設的那家在清單裡', () => {
    expect(providerInfo(DEFAULT_PROVIDER)).toBeDefined()
  })

  /**
   * 目錄是 UI 與路由共用的單一來源。少一家的話設定頁選不到，多一家的話
   * 選得到卻沒有對應的 createModel 分支 —— 兩種都要在這裡就爆掉。
   */
  it('每一家都真的建得出 model', () => {
    const env: LlmEnv = {
      GROQ_API_KEY: 'k',
      GEMINI_API_KEY: 'k',
      OPENAI_API_KEY: 'k',
      OPENROUTER_API_KEY: 'k',
      CEREBRAS_API_KEY: 'k',
      CLOUDFLARE_API_TOKEN: 'k',
      CLOUDFLARE_ACCOUNT_ID: 'acct',
    }
    for (const p of PROVIDER_CATALOG) {
      expect(
        createModel(env, { provider: p.id, model: p.sampleModel, fallback: false })
      ).toBeTruthy()
    }
  })
})

describe('asProvider', () => {
  it('認得清單裡的每一家', () => {
    for (const p of PROVIDER_CATALOG) expect(asProvider(p.id)).toBe(p.id)
  })

  it('認不得的一律回 undefined，讓呼叫端往下一層找', () => {
    expect(asProvider('deepseek')).toBeUndefined()
    expect(asProvider('')).toBeUndefined()
    expect(asProvider(undefined)).toBeUndefined()
    expect(asProvider('GROQ')).toBeUndefined() // 大小寫敏感
  })
})

describe('pingRoute', () => {
  const route = (provider: ModelProvider) => ({ provider, model: 'x', fallback: false })

  it('key 沒設定時直接回報缺哪一個，不打網路', async () => {
    const result = await pingRoute({}, route('groq'))

    expect(result.ok).toBe(false)
    expect(result.error).toContain('GROQ_API_KEY')
    expect(result.ms).toBe(0)
  })

  it('cloudflare 只給一半也算沒設定，訊息要指出兩個都要', async () => {
    const result = await pingRoute({ CLOUDFLARE_API_TOKEN: 't' }, route('cloudflare'))

    expect(result.ok).toBe(false)
    expect(result.error).toContain('CLOUDFLARE_API_TOKEN')
    expect(result.error).toContain('CLOUDFLARE_ACCOUNT_ID')
  })

  it('回傳的 route 標記看得出測的是哪一組', async () => {
    const result = await pingRoute({}, { provider: 'openai', model: 'gpt-4o', fallback: false })
    expect(result.route).toBe('openai:gpt-4o')
  })

  it('呼叫失敗時把錯誤訊息帶回去，並記下花了多久（不重試，所以很快回來）', async () => {
    const env: LlmEnv = { GROQ_API_KEY: 'bad-key' }
    let t = 1000
    const clock = () => {
      t += 250
      return t
    }

    // 不打真的網路：讓 fetch 直接拒絕，模擬 key 錯誤／端點不通
    const original = globalThis.fetch
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('401 Unauthorized'))
    try {
      const result = await pingRoute(env, route('groq'), clock)

      expect(result.ok).toBe(false)
      // SDK 會把底層錯誤包成自己的訊息（"Connection error." 之類），所以
      // 只保證「有東西可以顯示」，不綁定特定字串
      expect(result.error).toBeTruthy()
      expect(result.ms).toBeGreaterThan(0)
    } finally {
      globalThis.fetch = original
    }
  })
})
