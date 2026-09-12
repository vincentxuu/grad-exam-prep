import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'

function genId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  try {
    const rows = await ctx.db
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

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  try {
    const body = (await request.json()) as { content?: string; tags?: string[] }
    const { content, tags } = body
    if (!content?.trim()) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }

    const id = genId()
    const now = Date.now()

    await ctx.db
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
