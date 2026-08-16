import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'

const CF_VOICES = [
  'luna',
  'apollo',
  'athena',
  'orion',
  'arcas',
  'helios',
  'stella',
  'perseus',
  'angus',
  'orpheus',
]

interface TtsRequest {
  text?: string
  provider?: string
  voice?: string
}

interface Env {
  AI: Ai
  DB: D1Database
}

function cacheKey(speaker: string, text: string): string {
  return `${speaker}:${text.toLowerCase().trim()}`
}

/**
 * POST /api/tts
 * Body: { text, provider, voice? }
 * Returns: audio/mpeg blob
 */
export async function POST(request: NextRequest) {
  let body: TtsRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
  }

  const text = body.text?.trim()
  if (!text || text.length > 500) {
    return NextResponse.json({ error: '文字為空或過長（上限 500 字元）' }, { status: 400 })
  }

  const provider = body.provider ?? 'cloudflare'
  if (provider !== 'cloudflare') {
    return NextResponse.json({ error: `不支援的 provider: ${provider}` }, { status: 400 })
  }

  try {
    const { env: raw } = await getCloudflareContext({ async: true })
    const env = raw as unknown as Env
    const speaker = body.voice && CF_VOICES.includes(body.voice) ? body.voice : 'luna'
    const key = cacheKey(speaker, text)

    const cached = await env.DB.prepare('SELECT audio FROM tts_cache WHERE key = ?')
      .bind(key)
      .first<{ audio: number[] }>()

    if (cached) {
      // D1 reads BLOB columns back as number[]. Response would stringify that
      // array ("255,243,..."), so restore the binary MP3 body explicitly.
      const audio = Uint8Array.from(cached.audio)
      return new Response(audio, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=604800',
          'X-TTS-Cache': 'hit',
        },
      })
    }

    const result = await env.AI.run(
      '@cf/deepgram/aura-2-en' as Parameters<Ai['run']>[0],
      {
        text,
        speaker,
      } as Record<string, unknown>
    )

    const audio = result as unknown as ReadableStream | ArrayBuffer | Uint8Array
    const buffer =
      audio instanceof ArrayBuffer
        ? new Uint8Array(audio)
        : audio instanceof Uint8Array
          ? audio
          : new Uint8Array(await new Response(audio as ReadableStream).arrayBuffer())

    await env.DB.prepare(
      'INSERT INTO tts_cache (key, audio, created_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING'
    )
      .bind(key, buffer, Date.now())
      .run()

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800',
        'X-TTS-Cache': 'miss',
      },
    })
  } catch (err) {
    console.error('[tts cloudflare]', err)
    return NextResponse.json({ error: '語音生成失敗' }, { status: 502 })
  }
}
