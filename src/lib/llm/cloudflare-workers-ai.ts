import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import { SimpleChatModel } from '@langchain/core/language_models/chat_models'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessageChunk } from '@langchain/core/messages'
import { ChatGenerationChunk } from '@langchain/core/outputs'

interface CloudflareWorkersAiModelOptions {
  ai: Ai
  model: string
  maxTokens: number
}

function contentText(content: BaseMessage['content']): string {
  if (typeof content === 'string') return content
  return content
    .map((part) =>
      typeof part === 'string' ? part : 'text' in part ? String(part.text ?? '') : ''
    )
    .join('')
}

function messageRole(message: BaseMessage): string {
  switch (message.getType()) {
    case 'human':
      return 'user'
    case 'ai':
      return 'assistant'
    case 'system':
      return 'system'
    case 'tool':
      return 'tool'
    default:
      return 'user'
  }
}

function workersAiMessages(messages: BaseMessage[]) {
  return messages.map((message) => ({
    role: messageRole(message),
    content: contentText(message.content),
  }))
}

function responseText(output: unknown): string {
  if (typeof output === 'string') return output
  if (!output || typeof output !== 'object') return ''
  const obj = output as Record<string, unknown>

  // Format 1: { response: "..." } (llama, older models)
  if (typeof obj.response === 'string') return obj.response

  // Format 2: { choices: [{ message: { content: "..." } }] } (OpenAI-compatible)
  if (Array.isArray(obj.choices)) {
    const first = obj.choices[0] as Record<string, unknown> | undefined
    const msg = (first?.message ?? first?.delta) as Record<string, unknown> | undefined
    if (typeof msg?.content === 'string') return msg.content
    // Reasoning models (glm-4.7-flash) put output in reasoning_content when content is null
    if (msg?.content === null && typeof msg?.reasoning_content === 'string')
      return msg.reasoning_content
  }

  // Format 3: { result: { response: "..." } } or { result: { choices: [...] } }
  if (obj.result && typeof obj.result === 'object') {
    const inner = responseText(obj.result)
    if (inner) return inner
  }

  // Format 4: { content: "..." } (direct content)
  if (typeof obj.content === 'string') return obj.content

  // Format 5: { message: { content: "..." } } (unwrapped single message)
  if (obj.message && typeof obj.message === 'object') {
    const msg = obj.message as Record<string, unknown>
    if (typeof msg.content === 'string') return msg.content
  }

  return ''
}

async function readStreamToText(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(decoder.decode(value, { stream: true }))
    }
    chunks.push(decoder.decode())
  } finally {
    reader.releaseLock()
  }

  const raw = chunks.join('')

  // SSE stream: parse data lines
  if (raw.includes('data:')) {
    const parts: string[] = []
    for (const line of raw.split('\n')) {
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>
        const text = responseText(parsed)
        if (text) parts.push(text)
      } catch {
        parts.push(data)
      }
    }
    return parts.join('')
  }

  // Plain JSON response
  try {
    return responseText(JSON.parse(raw))
  } catch {
    return raw
  }
}

async function* responseDeltas(stream: ReadableStream): AsyncGenerator<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })

      const events = buffer.split(/\r?\n\r?\n/)
      buffer = done ? '' : (events.pop() ?? '')

      for (const event of events) {
        for (const line of event.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (!data) continue
          if (data === '[DONE]') return

          const parsed = JSON.parse(data) as Record<string, unknown>
          const text = responseText(parsed)
          if (text) yield text
        }
      }

      if (done) break
    }
  } finally {
    reader.releaseLock()
  }
}

/** LangChain 的薄轉接層；實際推論直接呼叫 Cloudflare Workers AI binding。 */
export class ChatCloudflareWorkersAI extends SimpleChatModel {
  private readonly ai: Ai
  private readonly model: string
  private readonly maxTokens: number

  constructor(options: CloudflareWorkersAiModelOptions) {
    super({})
    this.ai = options.ai
    this.model = options.model
    this.maxTokens = options.maxTokens
  }

  _llmType(): string {
    return 'cloudflare-workers-ai'
  }

  async _call(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    const output = await this.ai.run(
      this.model,
      {
        messages: workersAiMessages(messages),
        max_tokens: this.maxTokens,
      },
      options.signal ? { signal: options.signal } : undefined
    )

    // Some models return a ReadableStream even without stream: true
    if (output instanceof ReadableStream) {
      const text = await readStreamToText(output)
      if (text) await runManager?.handleLLMNewToken(text)
      return text
    }

    const text = responseText(output)
    if (text) await runManager?.handleLLMNewToken(text)

    // Last resort: stringify and log for debugging
    if (!text && output) {
      console.warn('[workers-ai] unexpected response shape:', JSON.stringify(output).slice(0, 500))
    }

    return text
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    const stream = (await this.ai.run(
      this.model,
      {
        messages: workersAiMessages(messages),
        max_tokens: this.maxTokens,
        stream: true,
      },
      options.signal ? { signal: options.signal } : undefined
    )) as unknown as ReadableStream

    for await (const text of responseDeltas(stream)) {
      await runManager?.handleLLMNewToken(text)
      yield new ChatGenerationChunk({
        text,
        message: new AIMessageChunk({ content: text }),
      })
    }
  }
}
