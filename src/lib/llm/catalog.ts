/**
 * Provider 目錄：純資料，**不 import 任何 LangChain**。
 *
 * 設定頁是 client component，要是它 import 了 `model.ts`，整包 LangChain
 * 就會被打進前端 bundle。所以「哪幾家、要什麼 key、model 長什麼樣」單獨
 * 放這裡，`model.ts` 與 UI 共用。
 */
export type ModelProvider =
  | 'groq'
  | 'google'
  | 'openai'
  | 'cloudflare'
  | 'openrouter'
  | 'cerebras'
  | 'ollama'

export interface ProviderInfo {
  id: ModelProvider
  label: string
  /** 這家要設定的環境變數。空陣列代表不需要 API key。 */
  envKeys: string[]
  /** 填在 model 欄位的範例，也當作 UI 的 placeholder。 */
  sampleModel: string
  /**
   * 現撈不到時退而求其次的清單（`models.ts`）。
   *
   * **這份一定會過期**，所以只當退路，不當正式清單 —— UI 會標明是不是
   * 現撈的。第一個元素就是 `sampleModel`。
   */
  fallbackModels: string[]
  note?: string
}

export const PROVIDER_CATALOG: ProviderInfo[] = [
  {
    id: 'groq',
    label: 'Groq',
    envKeys: ['GROQ_API_KEY'],
    sampleModel: 'llama-3.3-70b-versatile',
    fallbackModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    note: '有免費額度，速度快。',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    envKeys: ['GEMINI_API_KEY'],
    sampleModel: 'gemini-2.0-flash',
    fallbackModels: ['gemini-2.0-flash', 'gemini-2.0-flash-lite'],
    note: '也吃 GOOGLE_API_KEY。',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    envKeys: ['OPENAI_API_KEY'],
    sampleModel: 'gpt-4o-mini',
    fallbackModels: ['gpt-4o-mini', 'gpt-4o'],
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare Workers AI',
    envKeys: [],
    sampleModel: '@cf/zai-org/glm-4.7-flash',
    fallbackModels: [
      '@cf/zai-org/glm-4.7-flash',
      '@cf/openai/gpt-oss-120b',
      '@cf/ibm-granite/granite-4.0-h-micro',
      '@cf/qwen/qwen3-30b-a3b-fp8',
      '@cf/deepseek-ai/deepseek-v4-flash-0731',
    ],
    note: '預設。繁中佳、有 function calling。推理密集用 gpt-oss-120b，極省成本用 granite-4.0-h-micro。',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    envKeys: ['OPENROUTER_API_KEY'],
    sampleModel: 'anthropic/claude-3.5-sonnet',
    fallbackModels: ['anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001'],
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    envKeys: ['CEREBRAS_API_KEY'],
    sampleModel: 'llama-3.3-70b',
    fallbackModels: ['llama-3.3-70b'],
  },
  {
    id: 'ollama',
    label: 'Ollama（本機）',
    envKeys: [],
    sampleModel: 'llama3.3',
    fallbackModels: ['llama3.3'],
    note: '不需要 key，讀 OLLAMA_API_BASE。線上通常打不到。',
  },
]

const PROVIDER_IDS = new Set<string>(PROVIDER_CATALOG.map((p) => p.id))

export function providerInfo(id: string): ProviderInfo | undefined {
  return PROVIDER_CATALOG.find((p) => p.id === id)
}

/** 不認得的值一律回 undefined，讓呼叫端往下一層設定找。 */
export function asProvider(value: string | undefined): ModelProvider | undefined {
  return value && PROVIDER_IDS.has(value) ? (value as ModelProvider) : undefined
}
