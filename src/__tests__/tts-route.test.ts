/**
 * @jest-environment node
 */
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }))

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/tts/route'

const mockGetCloudflareContext = jest.mocked(getCloudflareContext)

describe('POST /api/tts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a cached D1 BLOB as binary MP3 bytes', async () => {
    const cachedBytes = [0xff, 0xf3, 0x64, 0xc4, 0x00, 0x12, 0x78, 0x9a]
    const first = jest.fn().mockResolvedValue({ audio: cachedBytes })
    const bind = jest.fn().mockReturnValue({ first })
    const prepare = jest.fn().mockReturnValue({ bind })
    const run = jest.fn()

    mockGetCloudflareContext.mockResolvedValue({
      env: {
        DB: { prepare },
        AI: { run },
      },
    } as never)

    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: ' Ambivalent ',
        provider: 'cloudflare',
        voice: 'luna',
      }),
    })

    const response = await POST(request as unknown as NextRequest)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg')
    expect(response.headers.get('X-TTS-Cache')).toBe('hit')
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual(cachedBytes)

    expect(prepare).toHaveBeenCalledWith('SELECT audio FROM tts_cache WHERE key = ?')
    expect(bind).toHaveBeenCalledWith('luna:ambivalent')
    expect(first).toHaveBeenCalledTimes(1)
    expect(run).not.toHaveBeenCalled()
  })
})
