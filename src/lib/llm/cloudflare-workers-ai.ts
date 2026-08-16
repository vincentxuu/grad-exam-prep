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
  if (!output || typeof output !== 'object' || !('response' in output)) return ''
  return typeof output.response === 'string' ? output.response : ''
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
    const text = responseText(output)
    if (text) await runManager?.handleLLMNewToken(text)
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
