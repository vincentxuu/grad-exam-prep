import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'
import type { UserPreferences } from '@/types/storage'

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const row = await ctx.db
    .prepare('SELECT data FROM user_preferences WHERE user_id = ?')
    .bind(ctx.user.id)
    .first<{ data: string }>()

  const preferences: UserPreferences = row ? JSON.parse(row.data) : { examId: 'im' }
  return NextResponse.json({ preferences })
}

export async function PATCH(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const updates: Partial<UserPreferences> = await request.json()

  const existing = await ctx.db
    .prepare('SELECT data FROM user_preferences WHERE user_id = ?')
    .bind(ctx.user.id)
    .first<{ data: string }>()

  const current: UserPreferences = existing ? JSON.parse(existing.data) : { examId: 'im' }
  const merged = { ...current, ...updates }

  await ctx.db
    .prepare(
      `INSERT INTO user_preferences (user_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
    )
    .bind(ctx.user.id, JSON.stringify(merged), Date.now())
    .run()

  return NextResponse.json({ preferences: merged })
}
