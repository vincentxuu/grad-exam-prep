import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'
import { generateEntry, generatePersonal } from '@/lib/lexicon/generate'
import { normalizeTerm, personaHash } from '@/lib/lexicon/normalize'
import {
  checkAndIncrementQuota,
  type Db,
  DEFAULT_DAILY_QUOTA,
  getEntry,
  getPersonal,
  putEntry,
  putPersonal,
  readQuota,
} from '@/lib/lexicon/store'
import { type LlmRuntimeConfig, loadConfig } from '@/lib/llm/config'
import type { LlmEnv } from '@/lib/llm/model'
import type { LookupResponse, PersonaProfile } from '@/types/lexicon'

interface Env extends LlmEnv {
  DB: D1Database
  PASSPHRASE_HASH?: string
  LEXICON_DAILY_QUOTA?: string
}

async function getEnv(): Promise<Env> {
  const { env } = await getCloudflareContext({ async: true })
  return env as unknown as Env
}

/** 優先序：D1 設定 → env → 程式預設。 */
function quotaLimit(env: Env, config: LlmRuntimeConfig): number {
  if (config.lexiconQuota) return config.lexiconQuota
  const n = Number(env.LEXICON_DAILY_QUOTA)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_QUOTA
}

/** 匿名 cookie UUID，與 src/lib/user-id.ts 同一把 key。 */
function getUserId(request: NextRequest): string | null {
  return request.cookies.get('gep_uid')?.value ?? null
}

/**
 * GET /api/lexicon?q=<term>
 *
 * 只讀快取，不生成、不計配額、不需要認證。前端先打這支探測，命中就免費。
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q')
  if (!raw) return NextResponse.json({ error: '缺少查詢字' }, { status: 400 })

  const normalized = normalizeTerm(raw)
  if (!normalized) return NextResponse.json({ error: '查詢字無效' }, { status: 400 })

  try {
    const env = await getEnv()
    const entry = await getEntry(env.DB as unknown as Db, normalized.term)
    if (!entry) return NextResponse.json({ error: '尚未快取' }, { status: 404 })

    const body: LookupResponse = {
      entry,
      cached: { entry: true, personal: false },
    }
    return NextResponse.json(body)
  } catch (err) {
    console.error('[lexicon GET]', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

/**
 * POST /api/lexicon
 * Body: { term: string, persona?: PersonaProfile }
 *
 * 缺什麼生什麼。配額閘門只擋真的要生成的請求 —— 已經在快取裡的不計費。
 */
export async function POST(request: NextRequest) {
  let payload: { term?: string; persona?: PersonaProfile }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
  }

  const normalized = payload.term ? normalizeTerm(payload.term) : null
  if (!normalized) return NextResponse.json({ error: '查詢字無效' }, { status: 400 })

  let env: Env
  try {
    env = await getEnv()
  } catch (err) {
    console.error('[lexicon POST getEnv]', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }

  // 有沒有 key 由 provider 路由自己判斷（不同 provider 看不同的 env）
  const db = env.DB as unknown as Db
  const config = await loadConfig(db)
  const limit = quotaLimit(env, config)

  // 帶通關密語的請求不受配額限制
  const unlimited = !!env.PASSPHRASE_HASH && validateBearerToken(request, env.PASSPHRASE_HASH)
  const userId = getUserId(request) ?? 'anonymous'

  /** 只在真的要花錢時才動配額。回 null 代表被擋下。 */
  async function spend(): Promise<{ used: number; limit: number } | null> {
    if (unlimited) return null
    const state = await checkAndIncrementQuota(db, userId, limit)
    if (!state.allowed) throw new QuotaExceeded(state.used, state.limit)
    return { used: state.used, limit: state.limit }
  }

  try {
    // ——— 通用詞條 ———
    let entry = await getEntry(db, normalized.term)
    const entryCached = !!entry

    if (!entry) {
      await spend()
      const result = await generateEntry(env, normalized.term, config)
      if (!result.ok) return generationError(result.reason, result.message)

      entry = result.data
      await putEntry(db, entry, result.route, normalized.term)
    }

    // ——— 個人化橋接 ———
    const hash = await personaHash(payload.persona)
    let personal = null
    let personalCached = false

    if (hash !== 'none' && payload.persona) {
      personal = await getPersonal(db, entry.headword, hash)
      personalCached = !!personal

      if (!personal) {
        await spend()
        const result = await generatePersonal(env, entry.headword, payload.persona, config)
        // 個人化失敗不該讓整次查詢失敗 —— 詞條本身已經有了，先給使用者
        if (result.ok) {
          personal = result.data
          await putPersonal(db, personal, hash)
        }
      }
    }

    const quota = unlimited ? undefined : await readQuota(db, userId, limit)

    const body: LookupResponse = {
      entry,
      ...(personal ? { personal } : {}),
      cached: { entry: entryCached, personal: personalCached },
      ...(quota ? { quota: { used: quota.used, limit: quota.limit } } : {}),
    }
    return NextResponse.json(body)
  } catch (err) {
    if (err instanceof QuotaExceeded) {
      return NextResponse.json(
        {
          error: `今天的查詞額度用完了（${err.used}/${err.limit}）。明天會重置，或輸入通關密語解除限制。`,
          quota: { used: err.used, limit: err.limit },
        },
        { status: 429 }
      )
    }
    console.error('[lexicon POST]', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

class QuotaExceeded extends Error {
  constructor(
    readonly used: number,
    readonly limit: number
  ) {
    super('quota exceeded')
  }
}

function generationError(reason: 'no-credentials' | 'invalid' | 'error', message: string) {
  if (reason === 'no-credentials') {
    return NextResponse.json(
      { error: '尚未設定 LLM API key，請參考 README 設定 worker secret。' },
      { status: 503 }
    )
  }
  if (reason === 'invalid') {
    return NextResponse.json({ error: '這個詞生成的結果不完整，再試一次。' }, { status: 422 })
  }
  return NextResponse.json({ error: `生成失敗：${message}` }, { status: 503 })
}
