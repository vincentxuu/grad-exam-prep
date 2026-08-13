import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'
import type { Db } from '@/lib/lexicon/store'
import { asProvider, providerInfo } from '@/lib/llm/catalog'
import { loadConfig } from '@/lib/llm/config'
import { pingRoute } from '@/lib/llm/invoke'
import { DEFAULT_MODEL, type LlmEnv, resolveRoute } from '@/lib/llm/model'

interface ConfigEnv extends LlmEnv {
  DB: D1Database
  PASSPHRASE_HASH?: string
}

/**
 * 測試連線：打一次最小的真實呼叫。
 *
 * 可以帶 provider／model 測「還沒存的那組」—— 先確認通了再存，比存下去
 * 讓查詞壞掉再回頭改好。不帶就測目前生效的設定。
 */
export async function POST(request: NextRequest) {
  const { env: raw } = await getCloudflareContext({ async: true })
  const env = raw as unknown as ConfigEnv

  if (!env.PASSPHRASE_HASH || !validateBearerToken(request, env.PASSPHRASE_HASH)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    provider?: string
    model?: string
  }

  const config = await loadConfig(env.DB as unknown as Db)
  const saved = resolveRoute(env, config)

  const provider = body.provider ? asProvider(body.provider) : undefined
  if (body.provider && !provider) {
    return NextResponse.json({ error: `不認得的 provider：${body.provider}` }, { status: 400 })
  }

  // 指定了 provider 卻沒指定 model 時，用那家的範例 model —— 不能沿用
  // 目前生效的 model，它屬於別家，一定打不通。
  const target = provider ?? saved.provider
  const model =
    body.model?.trim() ||
    (provider ? (providerInfo(provider)?.sampleModel ?? DEFAULT_MODEL) : saved.model)

  const result = await pingRoute(env, { provider: target, model, fallback: false })

  return NextResponse.json(result)
}
