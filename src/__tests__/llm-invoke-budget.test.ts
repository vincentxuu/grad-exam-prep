/**
 * @jest-environment node
 */
import { z } from 'zod'
import { generateStructured } from '@/lib/llm/invoke'
import type { LlmEnv } from '@/lib/llm/model'

const schema = z.object({ ok: z.boolean() })

/**
 * 兩條 route 都指到 cloudflare（fallback 只需要 AI binding，不用另一把 key），
 * 共用同一個 run mock —— 呼叫了幾次、分別打哪個 model 都看得到。
 */
function env(run: jest.Mock, withFallback = true): LlmEnv {
  return {
    AI: { run } as unknown as Ai,
    LLM_PROVIDER: 'cloudflare',
    LLM_MODEL: 'primary-model',
    ...(withFallback
      ? { LLM_FALLBACK_PROVIDER: 'cloudflare', LLM_FALLBACK_MODEL: 'fallback-model' }
      : {}),
  }
}

const calledModels = (run: jest.Mock) => run.mock.calls.map((call) => call[0])

describe('generateStructured 的呼叫預算', () => {
  it('模型一直吐不出 JSON 時，兩條 route 加起來最多打三次', async () => {
    const run = jest.fn().mockResolvedValue({ response: '這裡沒有 JSON' })

    const result = await generateStructured({ env: env(run), system: 's', user: 'u', schema })

    expect(result.ok).toBe(false)
    // 以前是主 2 次 + fallback 2 次 = 4 次完整生成，慢到連線會被切斷
    expect(run).toHaveBeenCalledTimes(3)
    // 主 route 吃 2 次，剩下 1 次留給 fallback —— fallback 不能被重試餓死
    expect(calledModels(run)).toEqual(['primary-model', 'primary-model', 'fallback-model'])
  })

  it('沒有設 fallback 時，單條 route 最多打兩次', async () => {
    const run = jest.fn().mockResolvedValue({ response: '這裡沒有 JSON' })

    await generateStructured({ env: env(run, false), system: 's', user: 'u', schema })

    expect(calledModels(run)).toEqual(['primary-model', 'primary-model'])
  })

  it('第一次就成功就不會有第二次', async () => {
    const run = jest.fn().mockResolvedValue({ response: '{"ok":true}' })

    const result = await generateStructured({ env: env(run), system: 's', user: 'u', schema })

    expect(result).toMatchObject({ ok: true, data: { ok: true } })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('截止訊號已經逾時就完全不打模型，回 timeout', async () => {
    const run = jest.fn().mockResolvedValue({ response: '{"ok":true}' })

    const result = await generateStructured({
      env: env(run),
      system: 's',
      user: 'u',
      schema,
      signal: AbortSignal.abort(),
    })

    expect(result).toEqual({ ok: false, reason: 'timeout', message: '生成超時' })
    expect(run).not.toHaveBeenCalled()
  })

  it('生成途中逾時：不再重試、也不退到 fallback', async () => {
    const controller = new AbortController()
    const run = jest.fn().mockImplementation(async () => {
      controller.abort()
      return { response: '這裡沒有 JSON' }
    })

    const result = await generateStructured({
      env: env(run),
      system: 's',
      user: 'u',
      schema,
      signal: controller.signal,
    })

    expect(result).toMatchObject({ reason: 'timeout' })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('把截止訊號一路傳到 AI binding，in-flight 的呼叫才取消得掉', async () => {
    const controller = new AbortController()
    const run = jest.fn().mockResolvedValue({ response: '{"ok":true}' })

    await generateStructured({
      env: env(run),
      system: 's',
      user: 'u',
      schema,
      signal: controller.signal,
    })

    expect(run).toHaveBeenCalledWith(
      'primary-model',
      expect.anything(),
      expect.objectContaining({ signal: controller.signal })
    )
  })
})
