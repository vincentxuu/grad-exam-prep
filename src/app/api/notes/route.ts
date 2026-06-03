import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getExpectedHash(): string | null {
  return process.env.PASSPHRASE_HASH ?? null
}

function genId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function GET(request: NextRequest) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const rows = await db
      .prepare('SELECT * FROM notes ORDER BY updated_at DESC')
      .all<{ id: string; content: string; tags: string; created_at: number; updated_at: number }>()

    const notes = (rows.results ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      tags: JSON.parse(r.tags),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const body = (await request.json()) as { content?: string; tags?: string[] }
    const { content, tags } = body
    if (!content?.trim()) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const id = genId()
    const now = Date.now()

    await db
      .prepare(
        'INSERT INTO notes (id, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, content, JSON.stringify(tags ?? []), now, now)
      .run()

    return NextResponse.json(
      { id, content, tags: tags ?? [], createdAt: now, updatedAt: now },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
