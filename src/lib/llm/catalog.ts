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
  /** 這家要設定的環境變數。多個代表全部都要（Workers AI 就是這種）。 */
  envKeys: string[]
  /** 填在 model 欄位的範例，也當作 UI 的 placeholder。 */
  sampleModel: string
  note?: string
}

export const PROVIDER_CATALOG: ProviderInfo[] = [
  {
    id: 'groq',
    label: 'Groq',
    envKeys: ['GROQ_API_KEY'],
    sampleModel: 'llama-3.3-70b-versatile',
    note: '預設。有免費額度，速度快。',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    envKeys: ['GEMINI_API_KEY'],
    sampleModel: 'gemini-2.0-flash',
    note: '也吃 GOOGLE_API_KEY。',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    envKeys: ['OPENAI_API_KEY'],
    sampleModel: 'gpt-4o-mini',
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare Workers AI',
    envKeys: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
    sampleModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    note: '跟站台同一個帳號。端點路徑帶帳號，所以兩個都要設。',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    envKeys: ['OPENROUTER_API_KEY'],
    sampleModel: 'anthropic/claude-3.5-sonnet',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    envKeys: ['CEREBRAS_API_KEY'],
    sampleModel: 'llama-3.3-70b',
  },
  {
    id: 'ollama',
    label: 'Ollama（本機）',
    envKeys: [],
    sampleModel: 'llama3.3',
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
