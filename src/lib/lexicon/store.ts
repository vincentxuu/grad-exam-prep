import { toTaiwanTraditionalDeep } from '@/lib/llm/traditional-chinese'
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
 * 詞條深度。
 *
 * `examples` 是 flashcard 用的輕量詞條，只有例句；`full` 是查詞面板用的
 * 完整詞條。兩者存在同一張表，讀的時候用 `minDepth` 挑。
 */
export type EntryDepth = 'examples' | 'full'

/** 0009 之前的資料列沒有 depth，那些全部是完整詞條。 */
function rowDepth(value: unknown): EntryDepth {
  return value === 'examples' ? 'examples' : 'full'
}

function meetsDepth(row: { data: string; depth?: unknown }, minDepth: EntryDepth): boolean {
  return minDepth === 'examples' || rowDepth(row.depth) === 'full'
}

interface GetEntryOptions {
  /**
   * 最低可接受的深度。預設 `examples` —— 有例句就夠的呼叫端（flashcard）
   * 拿到什麼都算命中。要完整詞條的呼叫端傳 `full`，輕量詞條會被當成
   * cache miss，交由上層重新生成並升級成完整詞條。
   */
  minDepth?: EntryDepth
}

/**
 * 查詞條。先找 headword，找不到再走 alias。
 *
 * alias 指向一筆已被刪掉的詞條時回傳 null（當成 cache miss 重新生成），
 * 不讓孤兒 alias 變成永久的查詢黑洞。深度不足時同樣回 null。
 */
export async function getEntry(
  db: Db,
  term: string,
  opts: GetEntryOptions = {}
): Promise<LexiconEntry | null> {
  const minDepth = opts.minDepth ?? 'examples'

  const direct = await db
    .prepare('SELECT data, depth FROM lexicon_entries WHERE headword = ?')
    .bind(term)
    .first<{ data: string; depth?: string }>()

  if (direct) {
    if (!meetsDepth(direct, minDepth)) return null
    return toTaiwanTraditionalDeep(JSON.parse(direct.data) as LexiconEntry)
  }

  const alias = await db
    .prepare('SELECT headword FROM lexicon_aliases WHERE alias = ?')
    .bind(term)
    .first<{ headword: string }>()

  if (!alias) return null

  const viaAlias = await db
    .prepare('SELECT data, depth FROM lexicon_entries WHERE headword = ?')
    .bind(alias.headword)
    .first<{ data: string; depth?: string }>()

  if (!viaAlias || !meetsDepth(viaAlias, minDepth)) return null
  return toTaiwanTraditionalDeep(JSON.parse(viaAlias.data) as LexiconEntry)
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
 *
 * `depth` 預設 `full`。DO UPDATE 上的 WHERE 是防降級的閘門：輕量詞條
 * 永遠不會蓋掉已經存在的完整詞條。呼叫端寫入前本來就查過快取，但兩個
 * 併發請求（一個查詞、一個 flashcard）還是有機會撞在一起。
 */
export async function putEntry(
  db: Db,
  entry: LexiconEntry,
  model: string,
  queriedAs: string,
  opts: { depth?: EntryDepth; now?: number } = {}
): Promise<void> {
  const depth = opts.depth ?? 'full'
  const now = opts.now ?? Date.now()

  await db
    .prepare(
      `INSERT INTO lexicon_entries (headword, kind, data, model, depth, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(headword) DO UPDATE SET
         kind = excluded.kind,
         data = excluded.data,
         model = excluded.model,
         depth = excluded.depth,
         created_at = excluded.created_at
       WHERE excluded.depth = 'full' OR lexicon_entries.depth <> 'full'`
    )
    .bind(entry.headword, entry.kind, JSON.stringify(entry), model, depth, now)
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

  return row ? toTaiwanTraditionalDeep(JSON.parse(row.data) as PersonalBridge) : null
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
