/**
 * 結構化輸出用的 JSON Schema。
 *
 * 限制（結構化輸出不支援，寫了會被拒）：
 *   - minLength / maxLength / minimum / minItems 等數量與長度約束
 *   - 遞迴 schema
 * 所以「例句至少三句」這種要求只能寫在 prompt 裡，不能寫在 schema 裡。
 *
 * 每個 object 都必須有 additionalProperties: false 與 required。
 */

const SENSE = {
  type: 'object',
  additionalProperties: false,
  required: ['pos', 'zh', 'en'],
  properties: {
    pos: { type: 'string', description: '詞性，例如 verb / noun / adjective' },
    zh: { type: 'string', description: '中文釋義' },
    en: { type: 'string', description: '英文釋義' },
    register: {
      type: 'string',
      enum: ['formal', 'informal', 'technical', 'academic'],
    },
  },
} as const

const EXAMPLE = {
  type: 'object',
  additionalProperties: false,
  required: ['en', 'zh'],
  properties: {
    en: { type: 'string' },
    zh: { type: 'string', description: '該例句的中文翻譯' },
    context: {
      type: 'string',
      enum: ['general', 'academic', 'technical', 'exam'],
    },
  },
} as const

export const LEXICON_ENTRY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'headword',
    'kind',
    'senses',
    'collocations',
    'phrases',
    'confusables',
    'synonyms',
    'antonyms',
    'examples',
  ],
  properties: {
    headword: {
      type: 'string',
      description:
        '這個詞的原形。若查詢字是屈折形（intercepted / studies / took），這裡要還原成原形（intercept / study / take）。片語不還原。',
    },
    kind: { type: 'string', enum: ['word', 'phrase'] },
    ipa: { type: 'string', description: 'KK 或 IPA 音標，不確定就省略' },
    senses: {
      type: 'array',
      items: SENSE,
      description: '所有常見義項，不是只有最常見的那一個',
    },
    collocations: {
      type: 'array',
      items: { type: 'string' },
      description: '常見搭配，例如 intercept a message',
    },
    phrases: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['phrase', 'zh'],
        properties: {
          phrase: { type: 'string' },
          zh: { type: 'string' },
        },
      },
      description: '由這個字延伸出來的片語',
    },
    confusables: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['word', 'zh', 'note'],
        properties: {
          word: { type: 'string' },
          zh: { type: 'string' },
          note: { type: 'string', description: '為什麼會混淆、怎麼分辨' },
        },
      },
    },
    synonyms: { type: 'array', items: { type: 'string' } },
    antonyms: { type: 'array', items: { type: 'string' } },
    examples: { type: 'array', items: EXAMPLE },
    examNote: { type: 'string', description: '研究所英文考試的重點提醒' },
  },
} as const

export const PERSONAL_BRIDGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['headword', 'examples', 'mnemonic'],
  properties: {
    headword: { type: 'string' },
    examples: {
      type: 'array',
      items: EXAMPLE,
      description: '用學習者自己的興趣與工作情境寫的例句',
    },
    mnemonic: {
      type: 'string',
      description: '一句話的記憶連結，把這個字扣回學習者的生活',
    },
  },
} as const
