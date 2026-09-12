# TTS D1 cache-hit BLOB regression test design

## Scope

- Add one focused route-level regression test at `src/__tests__/tts-route.test.ts`.
- Exercise only the confirmed cache-hit path in `src/app/api/tts/route.ts`.
- Do not call Cloudflare AI and do not require a real D1 database.
- The important production-shaped input is a D1 BLOB returned as `number[]`, not an `ArrayBuffer`.

## Repository conventions to follow

- Put `/** @jest-environment node */` at the top. Several existing unit tests use this, and Node provides the Fetch `Request`/`Response` APIs needed to inspect binary response bodies.
- Mock `@opennextjs/cloudflare` before importing the route, following `src/__tests__/llm-config.test.ts`. The package is pure ESM and is otherwise awkward in this Jest setup.
- Use the existing `@/` path alias and Jest globals; no new test dependency is needed.
- `node_modules/next/dist/docs/` is absent in the installed Next package, so there was no local route-handler testing guide to apply. This test calls the exported handler directly, which matches the route's current public seam.

## Recommended test

```ts
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

  it('returns cached D1 BLOB bytes as binary audio instead of serializing the number array', async () => {
    // D1 returns BLOB columns as an array of byte values on this deployed path.
    // Include an MP3-like frame prefix; exact byte preservation is what matters.
    const cachedBytes = [0xff, 0xfb, 0x90, 0x64, 0x00, 0x01, 0x02, 0x03]
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
      body: JSON.stringify({ text: ' Ambivalent ', provider: 'cloudflare', voice: 'luna' }),
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
```

## Why this catches the bug

The current cache-hit implementation passes `number[]` directly to `new Response(...)`. Fetch body conversion treats that array as the string `"255,251,144,100,0,1,2,3"`, so `response.arrayBuffer()` contains ASCII digits and commas instead of the cached MP3 bytes. The exact-byte assertion above fails before the fix and passes when the cached value is normalized to a binary body such as `Uint8Array.from(cached.audio)`.

Do not weaken the regression to only check status or `Content-Type`: the broken route already returns `200`, `audio/mpeg`, and `X-TTS-Cache: hit`.

## Optional adjacent coverage

Only after the focused regression is green, a parameterized cache-hit test could cover all runtime representations accepted by the implementation (`number[]`, `Uint8Array`, and `ArrayBuffer`). The required regression case remains `number[]`, because that reproduces the deployed D1 serialization shape.

## Verification command

```sh
npm test -- --runInBand src/__tests__/tts-route.test.ts
```

Expected behavior:

- Before the implementation fix: the byte equality assertion fails and shows ASCII bytes for the comma-separated decimal string.
- After the implementation fix: the test passes, and `AI.run` remains uncalled, proving the pre-generated MP3 was served from D1 rather than regenerated.
