import { type NextRequest, NextResponse } from 'next/server'
import type { Db } from '@/lib/lexicon/store'
import { requireAdmin } from '@/lib/llm/admin-auth'
import { asProvider, PROVIDER_CATALOG } from '@/lib/llm/catalog'
import { type LlmRuntimeConfig, loadConfig, saveConfig } from '@/lib/llm/config'
import { hasCredentials, resolveFallbackRoute, resolveRoute, routeLabel } from '@/lib/llm/model'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return unauthorized()
  const { env } = auth

  const config = await loadConfig(env.DB as unknown as Db)
  const primary = resolveRoute(env, config)
  const fallback = resolveFallbackRoute(env, config)

  return NextResponse.json({
    /** 表裡實際存了什麼（沒設定的欄位是 undefined） */
    config,
    /** 三層疊完之後真正會用的 route */
    effective: {
      primary: routeLabel(primary),
      fallback: fallback ? routeLabel(fallback) : null,
    },
    /**
     * 每家的 key 有沒有設定好。**只回布林值，不回 key 本身** ——
     * secret 讀得回來的話就不叫 secret 了。
     */
    credentials: Object.fromEntries(
      PROVIDER_CATALOG.map((p) => [
        p.id,
        hasCredentials(env, { provider: p.id, model: '', fallback: false }),
      ])
    ),
  })
}

/** 空字串代表「清掉這個欄位」，回頭吃 env 或程式預設。 */
function optionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function optionalCount(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return unauthorized()
  const { env } = auth

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })

  const provider = optionalText(body.provider)
  const fallbackProvider = optionalText(body.fallbackProvider)

  // 認不得的 provider 存進去只會被安靜忽略，不如在這裡就擋下來說清楚
  for (const [field, value] of [
    ['provider', provider],
    ['fallbackProvider', fallbackProvider],
  ] as const) {
    if (value && !asProvider(value)) {
      return NextResponse.json({ error: `${field} 不認得：${value}` }, { status: 400 })
    }
  }

  const config: LlmRuntimeConfig = {
    provider,
    model: optionalText(body.model),
    fallbackProvider,
    fallbackModel: optionalText(body.fallbackModel),
    lexiconQuota: optionalCount(body.lexiconQuota),
    chatQuota: optionalCount(body.chatQuota),
  }

  try {
    await saveConfig(env.DB as unknown as Db, config)
  } catch {
    return NextResponse.json(
      { error: '寫入失敗，可能是 0005_llm_config.sql 還沒套用' },
      { status: 500 }
    )
  }

  const primary = resolveRoute(env, config)
  return NextResponse.json({ ok: true, config, effective: { primary: routeLabel(primary) } })
}
