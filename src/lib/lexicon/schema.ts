import { z } from 'zod'

/**
 * 詞條的 zod schema。
 *
 * 用 zod 而不是手寫 JSON Schema，是因為 LangChain 的 `withStructuredOutput`
 * 吃 zod，而且解析失敗退回手動 JSON 時同一份 schema 還能拿來驗證。
 *
 * 每個欄位都給 `.describe()` —— 那些字會進到送給模型的 schema 裡，是
 * 除了 system prompt 之外第二個能約束輸出品質的地方。
 */
const senseSchema = z.object({
  pos: z.string().describe('詞性，例如 verb / noun / adjective'),
  zh: z.string().describe('中文釋義'),
  en: z.string().describe('英文釋義'),
  register: z.enum(['formal', 'informal', 'technical', 'academic']).optional().describe('語域'),
})

const exampleSchema = z.object({
  en: z.string(),
  zh: z.string().describe('該例句的中文翻譯'),
  context: z
    .enum(['general', 'academic', 'technical', 'exam'])
    .optional()
    .describe('這句話屬於哪種語域'),
})

export const lexiconEntrySchema = z.object({
  headword: z
    .string()
    .describe(
      '這個詞的原形。查詢字若是屈折形（intercepted / studies / took），要還原成原形（intercept / study / take）。片語不還原。'
    ),
  kind: z.enum(['word', 'phrase']),
  ipa: z.string().optional().describe('KK 或 IPA 音標，不確定就省略'),
  senses: z.array(senseSchema).describe('所有常見義項，不是只有最常見的那一個'),
  collocations: z.array(z.string()).default([]).describe('常見搭配，例如 intercept a message'),
  phrases: z
    .array(z.object({ phrase: z.string(), zh: z.string() }))
    .default([])
    .describe('由這個字延伸出來的片語'),
  confusables: z
    .array(
      z.object({
        word: z.string(),
        zh: z.string(),
        note: z.string().describe('為什麼會混淆、怎麼分辨'),
      })
    )
    .default([])
    .describe('拼字或語意相近、考試常拿來當誘答的字'),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  examples: z.array(exampleSchema).default([]).describe('至少三句，涵蓋不同語域'),
  examNote: z.string().optional().describe('研究所英文考試的重點提醒'),
})

/**
 * 輕量詞條的 schema。flashcard 的「產生例句」用。
 *
 * flashcard 只會渲染 `examples`，卻一直在跟完整詞條共用同一份 schema —— 那
 * 表示每按一次就要模型吐出所有義項、搭配、片語、易混淆字（4000 tokens 的
 * 繁體中文），生成時間長到會撞上連線逾時。這份只要例句，輸出量少一個
 * 數量級，也就快一個數量級。
 *
 * 缺的欄位由 `generate.ts` 補成空陣列，型別上仍然是一個 `LexiconEntry`；
 * 存進 D1 時標成 `depth = 'examples'`，查詞面板不會誤用它當完整詞條。
 */
export const lexiconExamplesSchema = z.object({
  headword: z
    .string()
    .describe(
      '這個詞的原形。查詢字若是屈折形（intercepted / studies / took），要還原成原形（intercept / study / take）。片語不還原。'
    ),
  kind: z.enum(['word', 'phrase']),
  ipa: z.string().optional().describe('KK 或 IPA 音標，不確定就省略'),
  examples: z.array(exampleSchema).describe('正好三句，一般／學術／技術各一句'),
})

export const personalBridgeSchema = z.object({
  headword: z.string(),
  examples: z.array(exampleSchema).describe('用學習者自己的興趣與工作情境寫的例句'),
  mnemonic: z.string().describe('一句話的記憶連結，把這個字扣回學習者的生活'),
})
