import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'
import { mergeDailyLearningRecords, sanitizeDailyLearningRecords } from '@/lib/daily-learning'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getExpectedHash(): string | null {
  return process.env.PASSPHRASE_HASH ?? null
}

export async function GET(request: NextRequest) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const row = await db
      .prepare('SELECT data FROM sync_state WHERE id = ?')
      .bind('main')
      .first<{ data: string }>()

    if (!row) return NextResponse.json(null, { status: 404 })
    return NextResponse.json(JSON.parse(row.data))
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  try {
    const state = await request.json()
    if (!isRecord(state)) return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const existing = await db
      .prepare('SELECT data FROM sync_state WHERE id = ?')
      .bind('main')
      .first<{ data: string }>()
    const cloudState = existing ? JSON.parse(existing.data) : null
    const cloudDailyLearning = isRecord(cloudState)
      ? sanitizeDailyLearningRecords(cloudState.dailyLearning)
      : {}
    const incomingDailyLearning = sanitizeDailyLearningRecords(state.dailyLearning)
    const mergedState = {
      ...state,
      dailyLearning: mergeDailyLearningRecords(cloudDailyLearning, incomingDailyLearning),
    }

    await db
      .prepare(
        'INSERT INTO sync_state (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
      )
      .bind('main', JSON.stringify(mergedState), Date.now())
      .run()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
