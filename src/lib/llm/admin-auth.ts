import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { validateBearerToken } from '@/lib/auth'
import type { LlmEnv } from './model'

export interface AdminEnv extends LlmEnv {
  DB: D1Database
  PASSPHRASE_HASH?: string
}

/**
 * 設定頁的四支 API 共用的守門。
 *
 * 沒設 `PASSPHRASE_HASH` 就整個關掉 —— 這些 API 能改全站 provider、能拿
 * 站台的 key 去打外部服務，不留沒有鎖的版本。
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ ok: true; env: AdminEnv } | { ok: false }> {
  const { env: raw } = await getCloudflareContext({ async: true })
  const env = raw as unknown as AdminEnv

  if (!env.PASSPHRASE_HASH || !validateBearerToken(request, env.PASSPHRASE_HASH)) {
    return { ok: false }
  }
  return { ok: true, env }
}
