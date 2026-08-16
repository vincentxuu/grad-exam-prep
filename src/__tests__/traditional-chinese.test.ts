/**
 * @jest-environment node
 */
import { AIMessageChunk } from '@langchain/core/messages'
import {
  plainMessageText,
  toTaiwanTraditional,
  toTaiwanTraditionalDeep,
  toTaiwanTraditionalStream,
} from '@/lib/llm/traditional-chinese'

describe('AI 簡體轉臺灣繁體', () => {
  it('包含臺灣慣用詞，不只逐字換字形', () => {
    expect(toTaiwanTraditional('软件工程师使用鼠标学习数据库和网络。')).toBe(
      '軟體工程師使用滑鼠學習資料庫和網路。'
    )
    expect(toTaiwanTraditional('Already Traditional：軟體工程師。')).toBe(
      'Already Traditional：軟體工程師。'
    )
  })

  it('遞迴轉換結構化輸出的字串值，但不改 key 與其他型別', () => {
    expect(
      toTaiwanTraditionalDeep({
        label: '学习',
        nested: ['软件', { text: '数据库', count: 2, ready: true, empty: null }],
      })
    ).toEqual({
      label: '學習',
      nested: ['軟體', { text: '資料庫', count: 2, ready: true, empty: null }],
    })
  })

  it('串流會先合併跨 chunk 詞組，再輸出一致的繁體內容', async () => {
    async function* source() {
      yield new AIMessageChunk({ content: '软' })
      yield new AIMessageChunk({ content: '件工程' })
      yield new AIMessageChunk({ content: '师正在学习数据库。' })
      yield new AIMessageChunk({ content: ' Next.' })
    }

    const chunks: string[] = []
    for await (const chunk of toTaiwanTraditionalStream(source())) {
      chunks.push(plainMessageText(chunk.content))
    }

    expect(chunks.join('')).toBe('軟體工程師正在學習資料庫。 Next.')
    expect(chunks[0]).toBe('軟體工程師正在學習資料庫。')
  })

  it('沒有標點的最後一段會在 EOF 時送出', async () => {
    async function* source() {
      yield new AIMessageChunk({ content: '内' })
      yield new AIMessageChunk({ content: '存管理' })
    }

    const chunks: string[] = []
    for await (const chunk of toTaiwanTraditionalStream(source())) {
      chunks.push(plainMessageText(chunk.content))
    }
    expect(chunks).toEqual(['記憶體管理'])
  })
})
