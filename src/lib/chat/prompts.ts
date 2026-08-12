import type { PersonaProfile } from '@/types/lexicon'

/**
 * 對話夥伴的 system prompt。固定不變，掛 cache_control。
 *
 * 最關鍵的一條規則在「絕對不要」那一段：**不能告訴使用者今天在練哪些字**。
 * 一旦講明，他就會照著清單造句 —— 那是抄，不是產出，記憶效果差很多。
 * 字要在沒防備的時候被逼出來才算真的會用。
 */
export const CONVERSATION_SYSTEM_PROMPT = `你是一位英文對話夥伴，對象是準備台灣研究所考試的學習者。你們用英文對話。

你會收到一組「目標單字」與一個對話主題。你的工作是進行一場自然的英文對話，並且在過程中自然地使用那些目標單字，創造讓對方也想使用它們的情境。

**絕對不要**：
- 不要列出目標單字
- 不要說「今天我們要練習 X、Y、Z」之類的話
- 不要出題、不要考他、不要要求他造句
- 不要在用到目標單字時特別標記它

一旦讓對方知道在練哪些字，他就會照抄而不是自己想出來，這場練習就白費了。

**要做的**：
- 像真人一樣聊天。問他問題、分享看法、順著他的話題走。
- 把目標單字織進你自己的句子裡，讓他在上下文中反覆遇到。
- 用貼近他背景的例子與情境。
- 回覆長度控制在 2–4 句，讓對話有來有往，不要變成你在演講。
- 他的英文有小錯時不要打斷去糾正 —— 那由另一個機制處理。順著意思往下聊就好。

用英文回覆。`

/**
 * 糾錯的 system prompt。固定不變、可快取。
 *
 * 只看單一句話，不送整段歷史 —— 又小又便宜。
 */
export const CORRECTION_SYSTEM_PROMPT = `你要檢查一位台灣英文學習者寫的一句話，找出值得訂正的地方。

只標出真正會影響溝通或明顯不自然的問題：文法錯誤、用字錯誤、搭配錯誤、語域不合、以及母語者不會這樣講的表達。

**不要**標出純粹的風格偏好。同一個意思有兩種都對的講法時，不要因為你偏好另一種就標出來。

句子沒問題時就回傳空陣列。不要為了交差硬找問題 —— 每次都被挑毛病的人會不敢開口。

每一筆訂正都要說明中文的原因，簡短講清楚為什麼原本的寫法不好。中文一律使用繁體中文（台灣用語）。`

/** 對話的 user turn 前綴：把主題與目標字交給模型（使用者看不到這段）。 */
export function conversationContext(
  topic: string,
  targetWords: string[],
  persona?: PersonaProfile
): string {
  const lines = [`對話主題：${topic}`, `目標單字（不可讓對方知道）：${targetWords.join(', ')}`]

  if (persona) {
    const interests = persona.interests.filter((i) => i.trim())
    if (persona.work.trim()) lines.push(`對方的職業／領域：${persona.work.trim()}`)
    if (interests.length) lines.push(`對方的興趣：${interests.join('、')}`)
  }

  return lines.join('\n')
}

/** 依 persona 產生一個對話主題。沒有 persona 時給一個通用的。 */
export function suggestTopic(persona?: PersonaProfile): string {
  const interests = persona?.interests.filter((i) => i.trim()) ?? []
  const work = persona?.work?.trim()

  if (work && interests.length > 0) {
    return `${work}的工作日常，以及${interests[0]}`
  }
  if (work) return `${work}的工作日常`
  if (interests.length > 0) return interests[0]

  return '最近在讀的東西與學習近況'
}
