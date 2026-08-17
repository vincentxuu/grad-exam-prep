import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import type { LlmEnv } from './model'

export interface AdminEnv extends LlmEnv {
  DB: D1Database
  JWT_SECRET: string
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ ok: true; env: AdminEnv } | { ok: false }> {
  const { env: raw } = await getCloudflareContext({ async: true })
  const env = raw as unknown as AdminEnv

  if (!env.JWT_SECRET) return { ok: false }

  const user = await authenticateRequest(request, env.JWT_SECRET)
  if (!user) return { ok: false }

  return { ok: true, env }
}
