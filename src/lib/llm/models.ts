import type { ModelProvider } from './catalog'
import { hasCredentials, type LlmEnv, providerEndpoint } from './model'

export interface ModelListResult {
  models: string[]
  /** live = 跟 provider 現撈的；fallback = 撈不到，退回目錄裡的範例 */
  source: 'live' | 'fallback'
  /** source 是 fallback 時說明為什麼 */
  note?: string
}

interface ModelsResponse {
  data?: { id?: unknown }[]
}

/**
 * 列出這家目前有哪些 model。
 *
 * 現撈而不是寫死清單 —— 寫死的清單過期得很快，而且過期的方式最惱人：
 * 選單裡有、選了打不通。各家的 OpenAI 相容端點都吃 `GET /models`。
 *
 * 撈不到就退回 `catalog.ts` 的範例 model（至少有一個能填），並把原因帶
 * 回去給 UI 說明，不要假裝是完整清單。
 */
export async function listModels(
  env: LlmEnv,
  provider: ModelProvider,
  fallback: string[],
  fetchImpl: typeof fetch = fetch
): Promise<ModelListResult> {
  if (!hasCredentials(env, { provider, model: '', fallback: false })) {
    return { models: fallback, source: 'fallback', note: 'API key 尚未設定，無法查詢' }
  }

  const { baseUrl, apiKey } = providerEndpoint(env, provider)

  try {
    const res = await fetchImpl(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      return { models: fallback, source: 'fallback', note: `provider 回 ${res.status}` }
    }

    const body = (await res.json()) as ModelsResponse
    const ids = (body.data ?? [])
      .map((m) => m?.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    if (!ids.length) {
      return { models: fallback, source: 'fallback', note: 'provider 沒有回傳任何 model' }
    }

    return { models: dedupeSorted(ids), source: 'live' }
  } catch (err) {
    return {
      models: fallback,
      source: 'fallback',
      note: err instanceof Error ? err.message : '查詢失敗',
    }
  }
}

/** 字典序即可 —— 裸名本來就會排在自己的日期戳版本前面。 */
function dedupeSorted(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b))
}
