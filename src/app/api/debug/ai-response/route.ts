import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const { model } = (await request.json()) as { model?: string }
  const targetModel = model ?? '@cf/zai-org/glm-4.7-flash'

  const { env } = await getCloudflareContext({ async: true })
  const ai = (env as unknown as { AI: Ai }).AI

  const output = await ai.run(
    targetModel as Parameters<Ai['run']>[0],
    {
      messages: [
        { role: 'system', content: 'Reply with exactly: OK' },
        { role: 'user', content: 'ping' },
      ],
      max_tokens: 32,
    } as Record<string, unknown>
  )

  const isStream = output instanceof ReadableStream
  let streamContent: string | null = null

  if (isStream) {
    const reader = (output as ReadableStream).getReader()
    const decoder = new TextDecoder()
    const chunks: string[] = []
    let done = false
    while (!done) {
      const result = await reader.read()
      done = result.done
      if (result.value) chunks.push(decoder.decode(result.value, { stream: !done }))
    }
    streamContent = chunks.join('')
  }

  return NextResponse.json({
    model: targetModel,
    isStream,
    type: typeof output,
    constructorName: output?.constructor?.name ?? null,
    keys: output && typeof output === 'object' && !isStream ? Object.keys(output as object) : null,
    raw: isStream ? null : output,
    streamContent,
  })
}
