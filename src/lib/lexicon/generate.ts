import { generateStructured, type LlmResult } from '@/lib/llm/invoke'
import type { LlmEnv } from '@/lib/llm/model'
import type { LexiconEntry, PersonalBridge, PersonaProfile } from '@/types/lexicon'
import {
  ENTRY_SYSTEM_PROMPT,
  entryUserPrompt,
  PERSONAL_SYSTEM_PROMPT,
  personalUserPrompt,
} from './prompts'
import { lexiconEntrySchema, personalBridgeSchema } from './schema'

/** 詞條內容較長，給多一點空間，免得義項與例句被截斷。 */
const ENTRY_MAX_TOKENS = 4000
const PERSONAL_MAX_TOKENS = 1500

export type GenerateResult<T> = LlmResult<T>

export function generateEntry(env: LlmEnv, term: string): Promise<GenerateResult<LexiconEntry>> {
  return generateStructured({
    env,
    system: ENTRY_SYSTEM_PROMPT,
    user: entryUserPrompt(term),
    schema: lexiconEntrySchema,
    maxTokens: ENTRY_MAX_TOKENS,
  })
}

export function generatePersonal(
  env: LlmEnv,
  headword: string,
  persona: PersonaProfile
): Promise<GenerateResult<PersonalBridge>> {
  return generateStructured({
    env,
    system: PERSONAL_SYSTEM_PROMPT,
    user: personalUserPrompt(headword, persona),
    schema: personalBridgeSchema,
    maxTokens: PERSONAL_MAX_TOKENS,
  })
}
