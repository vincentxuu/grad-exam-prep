/**
 * @jest-environment node
 */
import { PROVIDER_CATALOG } from '@/lib/llm/catalog'
import { type LlmEnv, providerEndpoint } from '@/lib/llm/model'
import { listModels } from '@/lib/llm/models'

const FALLBACK = ['fallback-model']
const KEYED: LlmEnv = { GROQ_API_KEY: 'k' }

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response
}

describe('providerEndpoint', () => {
  it('每一家都給得出 baseUrl', () => {
    const env: LlmEnv = { CLOUDFLARE_ACCOUNT_ID: 'acct' }
    for (const p of PROVIDER_CATALOG) {
      expect(providerEndpoint(env, p.id).baseUrl).toMatch(/^https?:\/\//)
    }
  })

  it('cloudflare 的路徑帶帳號', () => {
    const { baseUrl } = providerEndpoint({ CLOUDFLARE_ACCOUNT_ID: 'abc123' }, 'cloudflare')
    expect(baseUrl).toContain('/accounts/abc123/ai/v1')
  })

  it('ollama 吃得到自訂端點', () => {
    expect(providerEndpoint({ OLLAMA_API_BASE: 'http://box:1234/v1' }, 'ollama').baseUrl).toBe(
      'http://box:1234/v1'
    )
  })
})

describe('listModels', () => {
  it('沒有 key 就不打網路，直接退回內建清單', async () => {
    const fetchImpl = jest.fn()
    const result = await listModels({}, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(result).toEqual({
      models: FALLBACK,
      source: 'fallback',
      note: 'API key 尚未設定，無法查詢',
    })
  })

  it('撈得到就回 live，並帶上 Authorization', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse({ data: [{ id: 'b-model' }, { id: 'a-model' }] }))

    const result = await listModels(KEYED, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)

    expect(fetchImpl).toHaveBeenCalledWith('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: 'Bearer k' },
    })
    expect(result.source).toBe('live')
    expect(result.models).toEqual(['a-model', 'b-model']) // 排過序
  })

  it('去掉重複與非字串的 id', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse({
        data: [{ id: 'dup' }, { id: 'dup' }, { id: 42 }, {}, { id: '' }],
      })
    )

    const result = await listModels(KEYED, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)
    expect(result.models).toEqual(['dup'])
  })

  it('provider 回非 2xx 時退回內建清單並說明狀態碼', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(null, false, 403))

    const result = await listModels(KEYED, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)

    expect(result.source).toBe('fallback')
    expect(result.models).toEqual(FALLBACK)
    expect(result.note).toContain('403')
  })

  it('空清單也算撈不到 —— 給空選單比給過期選單更難用', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ data: [] }))

    const result = await listModels(KEYED, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)
    expect(result).toMatchObject({ models: FALLBACK, source: 'fallback' })
  })

  it('網路炸掉不會往上丟例外，設定頁還是打得開', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('boom'))

    const result = await listModels(KEYED, 'groq', FALLBACK, fetchImpl as unknown as typeof fetch)

    expect(result.source).toBe('fallback')
    expect(result.note).toBe('boom')
  })
})
