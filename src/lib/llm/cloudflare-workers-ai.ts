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

  // Legacy: { response: "..." }
  if (typeof obj.response === 'string') return obj.response

  // OpenAI-compatible: { choices: [{ message: { content, reasoning_content } }] }
  if (Array.isArray(obj.choices)) {
    const first = obj.choices[0] as Record<string, unknown> | undefined
    const msg = (first?.message ?? first?.delta) as Record<string, unknown> | undefined
    if (typeof msg?.content === 'string') return msg.content
    // Reasoning models: content is null, answer may be in reasoning_content
    if (msg?.content === null && typeof msg?.reasoning_content === 'string')
      return msg.reasoning_content
  }

  // Wrapped: { result: { ... } }
  if (obj.result && typeof obj.result === 'object') {
    const inner = responseText(obj.result)
    if (inner) return inner
  }

  if (typeof obj.content === 'string') return obj.content

  return ''
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
    // Reasoning models need more tokens (reasoning + content both count).
    // Give 3x the requested max to accommodate the thinking budget.
    const effectiveMax = Math.max(this.maxTokens, 8192)

    const output = await this.ai.run(
      this.model,
      {
        messages: workersAiMessages(messages),
        max_tokens: effectiveMax,
      } as Record<string, unknown>,
      options.signal ? { signal: options.signal } : undefined
    )

    if (output instanceof ReadableStream) {
      const reader = (output as ReadableStream).getReader()
      const decoder = new TextDecoder()
      const chunks: string[] = []
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) chunks.push(decoder.decode(result.value, { stream: !done }))
      }
      chunks.push(decoder.decode())
      const raw = chunks.join('')

      // Parse SSE or JSON
      if (raw.includes('data:')) {
        const parts: string[] = []
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            parts.push(responseText(JSON.parse(data)))
          } catch { /* skip */ }
        }
        const text = parts.filter(Boolean).join('')
        if (text) await runManager?.handleLLMNewToken(text)
        return text
      }

      try {
        const text = responseText(JSON.parse(raw))
        if (text) await runManager?.handleLLMNewToken(text)
        return text
      } catch {
        if (raw) await runManager?.handleLLMNewToken(raw)
        return raw
      }
    }

    const text = responseText(output)
    if (text) await runManager?.handleLLMNewToken(text)
    return text
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    const effectiveMax = Math.max(this.maxTokens, 8192)

    const stream = (await this.ai.run(
      this.model,
      {
        messages: workersAiMessages(messages),
        max_tokens: effectiveMax,
        stream: true,
      } as Record<string, unknown>,
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
