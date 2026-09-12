import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
import { ChatOpenAI } from '@langchain/openai'
import { asProvider, type ModelProvider } from './catalog'
import { ChatCloudflareWorkersAI } from './cloudflare-workers-ai'
import type { LlmRuntimeConfig } from './config'

/**
 * LLM provider 路由，做法沿用 quidproquo（vincentxuu/quidproquo 的
 * `src/lib/rag/model.ts`）：用 LangChain 當抽象層，預設 Workers AI，並支援
 * 失敗時退到另一家。
 *
 * 設定來源分兩層，優先序由高到低：
 *   1. D1 的 `llm_config`（`LlmRuntimeConfig`）—— 改完不用重新部署
 *   2. env 變數 —— 部署期設定
 *   3. 程式預設 cloudflare / @cf/qwen/qwen3-30b-a3b-fp8
 *
 * **外部 provider 的 API key 只從 env 讀，不進設定表**；Cloudflare 直接用
 * binding。wrangler secret 是加密存放且讀不回來，D1 是明文。
 *
 * env 從 Workers 的 `env` 物件讀，不用 `process.env` —— Workers 上
 * `process.env` 拿不到 secret。
 */
export type { ModelProvider }

export interface ModelRoute {
  provider: ModelProvider
  model: string
  /** 這條 route 本身是不是 fallback（避免無限退） */
  fallback: boolean
}

export interface LlmEnv {
  /** Cloudflare Workers AI binding（wrangler.json 的 `ai.binding`）。 */
  AI?: Ai
  LLM_PROVIDER?: string
  LLM_MODEL?: string
  LLM_FALLBACK_PROVIDER?: string
  LLM_FALLBACK_MODEL?: string

  GROQ_API_KEY?: string
  GOOGLE_API_KEY?: string
  GEMINI_API_KEY?: string
  OPENAI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  CEREBRAS_API_KEY?: string
  OLLAMA_API_BASE?: string
}

export const DEFAULT_PROVIDER: ModelProvider = 'cloudflare'
export const DEFAULT_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8'

export function resolveRoute(env: LlmEnv, config?: LlmRuntimeConfig): ModelRoute {
  return {
    provider: asProvider(config?.provider) ?? asProvider(env.LLM_PROVIDER) ?? DEFAULT_PROVIDER,
    model: config?.model || env.LLM_MODEL || DEFAULT_MODEL,
    fallback: false,
  }
}

export function resolveFallbackRoute(env: LlmEnv, config?: LlmRuntimeConfig): ModelRoute | null {
  const provider = asProvider(config?.fallbackProvider) ?? asProvider(env.LLM_FALLBACK_PROVIDER)
  if (!provider) return null

  return {
    provider,
    model: config?.fallbackModel || env.LLM_FALLBACK_MODEL || DEFAULT_MODEL,
    fallback: true,
  }
}

/** 這條 route 需要的 key 或 binding 有沒有設定。 */
export function hasCredentials(env: LlmEnv, route: ModelRoute): boolean {
  switch (route.provider) {
    case 'groq':
      return !!env.GROQ_API_KEY
    case 'google':
      return !!(env.GOOGLE_API_KEY || env.GEMINI_API_KEY)
    case 'openai':
      return !!env.OPENAI_API_KEY
    case 'cloudflare':
      return !!env.AI
    case 'openrouter':
      return !!env.OPENROUTER_API_KEY
    case 'cerebras':
      return !!env.CEREBRAS_API_KEY
    case 'ollama':
      return true // 本機端點，不需要 key
  }
}

export interface CreateModelOptions {
  maxTokens?: number
  /** 對話要串流，詞條不用 */
  streaming?: boolean
  /**
   * 失敗時重試幾次。預設沿用各家 SDK 的值（通常是 2～3 次退避重試）。
   *
   * 設定頁的「測試連線」會設 0 —— 那裡要的是「現在通不通」的即時答案，
   * 退避重試只會讓使用者對著轉圈多等十幾秒才看到同一個錯誤。
   */
  maxRetries?: number
}

/**
 * 各家的 OpenAI 相容端點與該用哪把 key。
 *
 * 抽出來是因為列出可用 model（`models.ts`）要打同一個 baseURL 的
 * `/models`。Cloudflare 是例外：它直接用 Workers AI binding，不走 REST。
 *
 * groq 與 google 有自己的 SDK，`createModel` 不吃這裡的 baseURL，但它們
 * 一樣有相容端點可以列 model，所以也放進來。
 */
export function providerEndpoint(
  env: LlmEnv,
  provider: ModelProvider
): { baseUrl: string; apiKey?: string } {
  switch (provider) {
    case 'groq':
      return { baseUrl: 'https://api.groq.com/openai/v1', apiKey: env.GROQ_API_KEY }
    case 'google':
      return {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        apiKey: env.GOOGLE_API_KEY || env.GEMINI_API_KEY,
      }
    case 'openai':
      return { baseUrl: 'https://api.openai.com/v1', apiKey: env.OPENAI_API_KEY }
    case 'cloudflare':
      throw new Error('Cloudflare Workers AI 使用 AI binding，沒有 REST endpoint')
    case 'openrouter':
      return { baseUrl: 'https://openrouter.ai/api/v1', apiKey: env.OPENROUTER_API_KEY }
    case 'cerebras':
      return { baseUrl: 'https://api.cerebras.ai/v1', apiKey: env.CEREBRAS_API_KEY }
    case 'ollama':
      return {
        baseUrl: env.OLLAMA_API_BASE || 'http://localhost:11434/v1',
        apiKey: 'ollama', // 端點不驗證，但 SDK 要求非空
      }
  }
}

export function createModel(
  env: LlmEnv,
  route: ModelRoute,
  opts: CreateModelOptions = {}
): BaseChatModel {
  const maxTokens = opts.maxTokens ?? 4000
  const { maxRetries } = opts

  // Cloudflare 走 Workers binding；groq/google 走各自 SDK，其餘走相容端點
  switch (route.provider) {
    case 'groq':
      return new ChatGroq(route.model, { apiKey: env.GROQ_API_KEY, maxTokens, maxRetries })

    case 'google':
      return new ChatGoogleGenerativeAI(route.model, {
        apiKey: env.GOOGLE_API_KEY || env.GEMINI_API_KEY,
        maxOutputTokens: maxTokens,
        maxRetries,
      })

    case 'cloudflare':
      if (!env.AI) throw new Error('Cloudflare Workers AI binding 尚未設定')
      return new ChatCloudflareWorkersAI({ ai: env.AI, model: route.model, maxTokens })

    default: {
      const { baseUrl, apiKey } = providerEndpoint(env, route.provider)
      return new ChatOpenAI(route.model, {
        apiKey,
        maxTokens,
        maxRetries,
        // openai 用預設 baseURL 就好，但明寫也不會錯，少一個分支
        configuration: { baseURL: baseUrl },
      })
    }
  }
}

/** 記在快取裡的 model 標記，方便日後知道哪些詞條是哪個模型生的。 */
export function routeLabel(route: ModelRoute): string {
  return `${route.provider}:${route.model}`
}
