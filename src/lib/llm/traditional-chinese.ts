import { AIMessageChunk } from '@langchain/core/messages'
import OpenCC from 'opencc-js/cn2t'

type Converter = ReturnType<typeof OpenCC.Converter>

let converter: Converter | undefined

function getConverter(): Converter {
  converter ??= OpenCC.Converter({ from: 'cn', to: 'twp' })
  return converter
}

/** 中國大陸簡體轉成臺灣繁體與慣用詞；英文與既有繁體會原樣保留。 */
export function toTaiwanTraditional(text: string): string {
  return text ? getConverter()(text) : text
}

/** 結構化輸出只遞迴轉字串值，不改 key、數字、布林或 null。 */
export function toTaiwanTraditionalDeep<T>(value: T): T {
  if (typeof value === 'string') return toTaiwanTraditional(value) as T
  if (Array.isArray(value)) return value.map(toTaiwanTraditionalDeep) as T

  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return value
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, toTaiwanTraditionalDeep(child)])
    ) as T
  }

  return value
}

export function plainMessageText(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === 'string'
          ? part
          : part && typeof part === 'object' && 'text' in part
            ? String((part as { text: unknown }).text)
            : ''
      )
      .join('')
  }
  return ''
}

type MessageStream = AsyncIterable<{ content: unknown }>

const HAN = /\p{Script=Han}/u
const SAFE_BOUNDARY = /[\s,.!?;:，。！？；：、]/u

function lastSafeBoundary(text: string): number {
  let end = 0
  for (const match of text.matchAll(new RegExp(SAFE_BOUNDARY, 'gu'))) {
    end = (match.index ?? 0) + match[0].length
  }
  return end
}

/**
 * 把模型串流正規化成繁體 chunks。
 *
 * OpenCC 會做詞組判斷，所以不能把「软」與下一塊的「件」各自轉。中文先
 * 緩衝到空白／標點邊界，英文則直接送出；EOF 會沖掉最後一段。
 */
export async function* toTaiwanTraditionalStream(
  source: MessageStream | Promise<MessageStream>
): AsyncGenerator<AIMessageChunk> {
  let pending = ''

  for await (const chunk of await source) {
    pending += plainMessageText(chunk.content)
    if (!pending) continue

    const boundary = lastSafeBoundary(pending)
    if (boundary > 0) {
      const ready = pending.slice(0, boundary)
      pending = pending.slice(boundary)
      yield new AIMessageChunk({ content: toTaiwanTraditional(ready) })
    } else if (!HAN.test(pending)) {
      yield new AIMessageChunk({ content: pending })
      pending = ''
    }
  }

  if (pending) yield new AIMessageChunk({ content: toTaiwanTraditional(pending) })
}
