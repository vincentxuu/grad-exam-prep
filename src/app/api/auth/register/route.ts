import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'
import { createJWT, generateSalt, hashPassword } from '@/lib/auth'

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
  if (password.length < 6) {
    return NextResponse.json({ error: '密碼至少 6 個字' }, { status: 400 })
  }

  const { env } = await getCloudflareContext({ async: true })
  const { DB, JWT_SECRET } = env as unknown as CloudflareEnv

  const existing = await DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first()
  if (existing) {
    return NextResponse.json({ error: '此 email 已註冊' }, { status: 409 })
  }

  const id = crypto.randomUUID()
  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  await DB.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, email, `${salt}:${passwordHash}`, Date.now())
    .run()

  const token = await createJWT({ id, email }, JWT_SECRET)
  return NextResponse.json({ token, user: { id, email } })
}
