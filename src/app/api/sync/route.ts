import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'

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
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const state = await request.json()
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB

    await db
      .prepare(
        'INSERT INTO sync_state (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
      )
      .bind('main', JSON.stringify(state), Date.now())
      .run()

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
