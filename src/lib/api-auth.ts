import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'
import { authenticateRequest, type AuthUser } from '@/lib/auth'

export interface AuthedContext {
  user: AuthUser
  db: D1Database
}

export async function withAuth(
  request: Request
): Promise<AuthedContext | NextResponse> {
  const { env } = await getCloudflareContext({ async: true })
  const { DB, JWT_SECRET } = env as unknown as CloudflareEnv

  const user = await authenticateRequest(request, JWT_SECRET)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { user, db: DB }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function isAuthed(result: AuthedContext | NextResponse): result is AuthedContext {
  return 'user' in result
}
