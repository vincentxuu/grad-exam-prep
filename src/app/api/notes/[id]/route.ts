import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import { validateBearerToken } from '@/lib/auth'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getExpectedHash(): string | null {
  return process.env.PASSPHRASE_HASH ?? null
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const { id } = await params
    const { content, tags } = (await request.json()) as { content: string; tags?: string[] }
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const now = Date.now()

    await db
      .prepare('UPDATE notes SET content = ?, tags = ?, updated_at = ? WHERE id = ?')
      .bind(content, JSON.stringify(tags ?? []), now, id)
      .run()

    return NextResponse.json({ id, content, tags: tags ?? [], updatedAt: now })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const hash = getExpectedHash()
  if (!hash || !validateBearerToken(request, hash)) return unauthorized()

  try {
    const { id } = await params
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB

    await db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run()
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
