import type { LlmRuntimeConfig } from '@/lib/llm/config'
import { generateStructured, type LlmResult } from '@/lib/llm/invoke'
import type { LlmEnv } from '@/lib/llm/model'
import type { LexiconEntry, PersonalBridge, PersonaProfile } from '@/types/lexicon'
import {
  ENTRY_SYSTEM_PROMPT,
  EXAMPLES_SYSTEM_PROMPT,
  entryUserPrompt,
  examplesUserPrompt,
  PERSONAL_SYSTEM_PROMPT,
  personalUserPrompt,
} from './prompts'
import { lexiconEntrySchema, lexiconExamplesSchema, personalBridgeSchema } from './schema'

/** 詞條內容較長，給多一點空間，免得義項與例句被截斷。 */
const ENTRY_MAX_TOKENS = 4000
/**
 * 只有三句例句，四千個 token 是在讓使用者白等。
 *
 * 三句例句連中譯大約 300 個 token，這裡留了幾倍餘裕 —— 有些模型（例如
 * 預設的 glm-4.7-flash）會先吐一段推理再給 JSON，壓太死反而會在 JSON
 * 收尾前被截斷，換來一次必然失敗的重試。
 */
const EXAMPLES_MAX_TOKENS = 1500
const PERSONAL_MAX_TOKENS = 1500

export type GenerateResult<T> = LlmResult<T>

/** 每個生成函式都吃一個截止訊號，逾時就地放棄。 */
interface GenerateOptions {
  config?: LlmRuntimeConfig
  signal?: AbortSignal
}

export function generateEntry(
  env: LlmEnv,
  term: string,
  opts: GenerateOptions = {}
): Promise<GenerateResult<LexiconEntry>> {
  return generateStructured({
    env,
    config: opts.config,
    signal: opts.signal,
    system: ENTRY_SYSTEM_PROMPT,
    user: entryUserPrompt(term),
    schema: lexiconEntrySchema,
    maxTokens: ENTRY_MAX_TOKENS,
  })
}

/**
 * flashcard 用的輕量生成：只要三句例句。
 *
 * 回傳的仍然是一個完整的 `LexiconEntry`，缺的欄位補空陣列 —— 呼叫端不用
 * 為了這條路徑再長出一套型別，而它在 D1 裡標成 `depth = 'examples'`，
 * 查詞面板不會把它誤當完整詞條。
 */
export async function generateExamplesEntry(
  env: LlmEnv,
  term: string,
  opts: GenerateOptions = {}
): Promise<GenerateResult<LexiconEntry>> {
  const result = await generateStructured({
    env,
    config: opts.config,
    signal: opts.signal,
    system: EXAMPLES_SYSTEM_PROMPT,
    user: examplesUserPrompt(term),
    schema: lexiconExamplesSchema,
    maxTokens: EXAMPLES_MAX_TOKENS,
  })

  if (!result.ok) return result

  const { headword, kind, ipa, examples } = result.data
  return {
    ok: true,
    route: result.route,
    data: {
      headword,
      kind,
      ...(ipa ? { ipa } : {}),
      senses: [],
      collocations: [],
      phrases: [],
      confusables: [],
      synonyms: [],
      antonyms: [],
      examples,
    },
  }
}

export function generatePersonal(
  env: LlmEnv,
  headword: string,
  persona: PersonaProfile,
  opts: GenerateOptions = {}
): Promise<GenerateResult<PersonalBridge>> {
  return generateStructured({
    env,
    config: opts.config,
    signal: opts.signal,
    system: PERSONAL_SYSTEM_PROMPT,
    user: personalUserPrompt(headword, persona),
    schema: personalBridgeSchema,
    maxTokens: PERSONAL_MAX_TOKENS,
  })
}
