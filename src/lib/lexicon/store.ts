import type { LexiconEntry, PersonalBridge } from '@/types/lexicon'

/**
 * D1 的最小介面。用結構型別而不是 import D1Database，測試才好塞假的進來。
 */
export interface Db {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>
      run(): Promise<unknown>
      all<T = unknown>(): Promise<{ results?: T[] }>
    }
  }
}

export const DEFAULT_DAILY_QUOTA = 60

// —————————————————————————————— 詞條 ——————————————————————————————

/**
 * 查詞條。先找 headword，找不到再走 alias。
 *
 * alias 指向一筆已被刪掉的詞條時回傳 null（當成 cache miss 重新生成），
 * 不讓孤兒 alias 變成永久的查詢黑洞。
 */
export async function getEntry(db: Db, term: string): Promise<LexiconEntry | null> {
  const direct = await db
    .prepare('SELECT data FROM lexicon_entries WHERE headword = ?')
    .bind(term)
    .first<{ data: string }>()

  if (direct) return JSON.parse(direct.data) as LexiconEntry

  const alias = await db
    .prepare('SELECT headword FROM lexicon_aliases WHERE alias = ?')
    .bind(term)
    .first<{ headword: string }>()

  if (!alias) return null

  const viaAlias = await db
    .prepare('SELECT data FROM lexicon_entries WHERE headword = ?')
    .bind(alias.headword)
    .first<{ data: string }>()

  return viaAlias ? (JSON.parse(viaAlias.data) as LexiconEntry) : null
}

/**
 * 寫入詞條，並在查詢字是屈折形時建立 alias。
 *
 * alias 只在兩個條件都成立時才寫：
 *   1. 查詢字與原形不同（相同的話沒有 alias 可言）
 *   2. 查詢字本身不是另一筆詞條的 headword
 *
 * 第二條是關鍵。`left` 是 `leave` 的過去式，但 `left` 本身也是一個獨立
 * 的詞條（左邊）。若查 `left` 時模型還原成 `leave` 就寫下 alias，之後所有
 * 查 `left` 的人都會被導去 `leave`，永遠看不到「左邊」那筆。
 */
export async function putEntry(
  db: Db,
  entry: LexiconEntry,
  model: string,
  queriedAs: string,
  now: number = Date.now()
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO lexicon_entries (headword, kind, data, model, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(headword) DO UPDATE SET
         kind = excluded.kind,
         data = excluded.data,
         model = excluded.model,
         created_at = excluded.created_at`
    )
    .bind(entry.headword, entry.kind, JSON.stringify(entry), model, now)
    .run()

  if (queriedAs === entry.headword) return

  const collides = await db
    .prepare('SELECT 1 AS hit FROM lexicon_entries WHERE headword = ?')
    .bind(queriedAs)
    .first<{ hit: number }>()

  if (collides) return

  await db
    .prepare(
      `INSERT INTO lexicon_aliases (alias, headword, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(alias) DO NOTHING`
    )
    .bind(queriedAs, entry.headword, now)
    .run()
}

// ———————————————————————— 個人化橋接 ————————————————————————

export async function getPersonal(
  db: Db,
  headword: string,
  personaHash: string
): Promise<PersonalBridge | null> {
  const row = await db
    .prepare('SELECT data FROM lexicon_personal WHERE headword = ? AND persona_hash = ?')
    .bind(headword, personaHash)
    .first<{ data: string }>()

  return row ? (JSON.parse(row.data) as PersonalBridge) : null
}

export async function putPersonal(
  db: Db,
  bridge: PersonalBridge,
  personaHash: string,
  now: number = Date.now()
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO lexicon_personal (headword, persona_hash, data, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(headword, persona_hash) DO UPDATE SET
         data = excluded.data,
         created_at = excluded.created_at`
    )
    .bind(bridge.headword, personaHash, JSON.stringify(bridge), now)
    .run()
}

// —————————————————————————————— 配額 ——————————————————————————————

export interface QuotaState {
  allowed: boolean
  used: number
  limit: number
}

/** UTC 的 YYYY-MM-DD。用 UTC 而不是本地時區，免得換裝置就換一天。 */
export function quotaDay(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** 只讀配額，不遞增。用在「這次會不會花錢」還沒確定的時候。 */
export async function readQuota(
  db: Db,
  userId: string,
  limit: number = DEFAULT_DAILY_QUOTA,
  now: number = Date.now()
): Promise<QuotaState> {
  const row = await db
    .prepare('SELECT count FROM lexicon_quota WHERE user_id = ? AND day = ?')
    .bind(userId, quotaDay(now))
    .first<{ count: number }>()

  const used = row?.count ?? 0
  return { allowed: used < limit, used, limit }
}

/**
 * 檢查並遞增配額。**只在真的要生成（會花錢）時呼叫。**
 *
 * 已達上限時不遞增，直接回 allowed: false。
 */
export async function checkAndIncrementQuota(
  db: Db,
  userId: string,
  limit: number = DEFAULT_DAILY_QUOTA,
  now: number = Date.now()
): Promise<QuotaState> {
  const current = await readQuota(db, userId, limit, now)
  if (!current.allowed) return current

  await db
    .prepare(
      `INSERT INTO lexicon_quota (user_id, day, count)
       VALUES (?, ?, 1)
       ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1`
    )
    .bind(userId, quotaDay(now))
    .run()

  return { allowed: true, used: current.used + 1, limit }
}
