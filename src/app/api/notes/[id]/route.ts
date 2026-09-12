import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  try {
    const { id } = await params
    const { content, tags } = (await request.json()) as { content: string; tags?: string[] }
    const now = Date.now()

    await ctx.db
      .prepare('UPDATE notes SET content = ?, tags = ?, updated_at = ? WHERE id = ?')
      .bind(content, JSON.stringify(tags ?? []), now, id)
      .run()

    return NextResponse.json({ id, content, tags: tags ?? [], updatedAt: now })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  try {
    const { id } = await params
    await ctx.db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run()
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
