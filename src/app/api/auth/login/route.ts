import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'
import { createJWT, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: '請輸入 email 與密碼' }, { status: 400 })
  }

  const { env } = await getCloudflareContext({ async: true })
  const { DB, JWT_SECRET } = env as unknown as CloudflareEnv

  const row = await DB.prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string; password_hash: string }>()

  if (!row) {
    return NextResponse.json({ error: 'email 或密碼錯誤' }, { status: 401 })
  }

  const [salt, storedHash] = row.password_hash.split(':')
  const inputHash = await hashPassword(password, salt)

  if (inputHash !== storedHash) {
    return NextResponse.json({ error: 'email 或密碼錯誤' }, { status: 401 })
  }

  const token = await createJWT({ id: row.id, email: row.email }, JWT_SECRET)
  return NextResponse.json({ token, user: { id: row.id, email: row.email } })
}
