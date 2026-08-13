import type { Db } from '@/lib/lexicon/store'
import type { ChatMessage, ChatSession, Correction } from '@/types/chat'
import { MAX_SESSION_MESSAGES } from '@/types/chat'

export interface SessionRow {
  id: string
  user_id: string
  topic: string
  target_words: string
  correct_mode: number
  created_at: number
  ended_at: number | null
}

function toSession(row: SessionRow): ChatSession {
  return {
    id: row.id,
    topic: row.topic,
    targetWords: JSON.parse(row.target_words) as string[],
    correctMode: row.correct_mode === 1,
    createdAt: row.created_at,
    endedAt: row.ended_at ?? undefined,
  }
}

export async function createSession(
  db: Db,
  session: ChatSession & { userId: string }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO chat_sessions (id, user_id, topic, target_words, correct_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      session.id,
      session.userId,
      session.topic,
      JSON.stringify(session.targetWords),
      session.correctMode ? 1 : 0,
      session.createdAt
    )
    .run()
}

export async function getSession(db: Db, id: string, userId: string): Promise<ChatSession | null> {
  const row = await db
    .prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<SessionRow>()

  return row ? toSession(row) : null
}

export async function endSession(db: Db, id: string, now: number = Date.now()): Promise<void> {
  await db.prepare('UPDATE chat_sessions SET ended_at = ? WHERE id = ?').bind(now, id).run()
}

export async function getMessages(db: Db, sessionId: string): Promise<ChatMessage[]> {
  const rows = await db
    .prepare(
      `SELECT id, role, content, used_words, created_at
       FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`
    )
    .bind(sessionId)
    .all<{
      id: string
      role: 'user' | 'assistant'
      content: string
      used_words: string | null
      created_at: number
    }>()

  return (rows.results ?? []).map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    usedWords: r.used_words ? (JSON.parse(r.used_words) as string[]) : undefined,
    createdAt: r.created_at,
  }))
}

export async function countMessages(db: Db, sessionId: string): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) AS n FROM chat_messages WHERE session_id = ?')
    .bind(sessionId)
    .first<{ n: number }>()

  return row?.n ?? 0
}

/**
 * 這場對話是否已達訊息上限。
 *
 * 上限在資料層擋，不在 UI —— UI 只是其中一個呼叫端，把規則放在這裡
 * 才不會有人繞過去。
 */
export async function isSessionFull(db: Db, sessionId: string): Promise<boolean> {
  return (await countMessages(db, sessionId)) >= MAX_SESSION_MESSAGES
}

export async function addMessage(db: Db, sessionId: string, message: ChatMessage): Promise<void> {
  await db
    .prepare(
      `INSERT INTO chat_messages (id, session_id, role, content, used_words, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      message.id,
      sessionId,
      message.role,
      message.content,
      message.usedWords ? JSON.stringify(message.usedWords) : null,
      message.createdAt
    )
    .run()
}

export async function addCorrections(
  db: Db,
  sessionId: string,
  messageId: string,
  corrections: Correction[],
  now: number = Date.now()
): Promise<void> {
  for (const [i, c] of corrections.entries()) {
    await db
      .prepare(
        `INSERT INTO chat_corrections (id, message_id, session_id, data, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING`
      )
      .bind(`${messageId}-c${i}`, messageId, sessionId, JSON.stringify(c), now)
      .run()
  }
}

export async function getCorrections(db: Db, sessionId: string): Promise<Correction[]> {
  const rows = await db
    .prepare('SELECT data FROM chat_corrections WHERE session_id = ? ORDER BY created_at ASC')
    .bind(sessionId)
    .all<{ data: string }>()

  return (rows.results ?? []).map((r) => JSON.parse(r.data) as Correction)
}
