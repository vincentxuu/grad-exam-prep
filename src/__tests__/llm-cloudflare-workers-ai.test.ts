/**
 * @jest-environment node
 */
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { generateStructured, messageText } from '@/lib/llm/invoke'
import { createModel } from '@/lib/llm/model'

const route = {
  provider: 'cloudflare' as const,
  model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  fallback: false,
}

function binding(run: jest.Mock) {
  return { AI: { run } as unknown as Ai }
}

describe('Cloudflare Workers AI binding model', () => {
  it('非串流直接呼叫 AI binding，並轉換訊息角色', async () => {
    const run = jest.fn().mockResolvedValue({ response: '软件工程师' })
    const model = createModel(binding(run), route, { maxTokens: 321 })

    const response = await model.invoke([
      new SystemMessage('system'),
      new HumanMessage('hello'),
      new AIMessage('hi'),
    ])

    expect(messageText(response.content)).toBe('軟體工程師')
    expect(run).toHaveBeenCalledWith(
      route.model,
      {
        messages: [
          { role: 'system', content: 'system' },
          { role: 'user', content: 'hello' },
          { role: 'assistant', content: 'hi' },
        ],
        max_tokens: 321,
      },
      undefined
    )
  })

  it('串流能解析跨 transport chunk 的 SSE，並在 DONE 停止', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"res'))
        controller.enqueue(encoder.encode('ponse":"Hel"}\n\ndata: {"response":"lo"}\n\n'))
        controller.enqueue(encoder.encode('data: [DONE]\n\ndata: {"response":"ignored"}\n\n'))
        controller.close()
      },
    })
    const run = jest.fn().mockResolvedValue(stream)
    const model = createModel(binding(run), route, { maxTokens: 99, streaming: true })

    let text = ''
    for await (const chunk of await model.stream([new HumanMessage('hello')])) {
      text += messageText(chunk.content)
    }

    expect(text).toBe('Hello')
    expect(run).toHaveBeenCalledWith(
      route.model,
      {
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 99,
        stream: true,
      },
      undefined
    )
  })

  it('結構化生成會經 binding 回傳並通過 schema 驗證', async () => {
    const run = jest.fn().mockResolvedValue({ response: '{"answer":"软件工程师正在学习"}' })

    const result = await generateStructured({
      env: binding(run),
      system: 'Return JSON',
      user: 'ping',
      schema: z.object({ answer: z.string() }),
      maxTokens: 64,
    })

    expect(result).toEqual({
      ok: true,
      data: { answer: '軟體工程師正在學習' },
      route: `cloudflare:${route.model}`,
    })
    expect(run).toHaveBeenCalledTimes(1)
  })
})
