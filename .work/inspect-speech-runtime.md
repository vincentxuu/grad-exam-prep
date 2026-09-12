# Flashcard speech runtime diagnosis

Date: 2026-08-16 (Asia/Taipei)

Scope: diagnose only. No implementation files changed.

## Conclusion

The production endpoint is reachable and has both the `AI` and `DB` bindings needed to serve TTS. The no-audio symptom is caused by the **D1 cache-hit response converting a BLOB byte array into comma-separated ASCII text**.

For the screenshot word `ambivalent`, production returned:

```text
HTTP/2 200
content-type: audio/mpeg
x-tts-cache: hit
```

However, the response body was not MP3 binary:

```text
file /private/tmp/tts.body
ASCII text, with very long lines (25101), with no line terminators

xxd -l 96 /private/tmp/tts.body
00000000: 3235 352c 3234 332c 3130 302c 3139 362c  255,243,100,196,
```

Parsing the comma-separated values shows that they are the original audio bytes serialized as text:

```text
characters: 25101
numeric byte values: 7056
first values: [255, 243, 100, 196, 0, 18, ...]
decoded first bytes: ff f3 64 c4 00 12 ...
```

`ff f3 ...` is consistent with an MPEG audio frame, but the browser receives the ASCII bytes `32 35 35 2c ...` (`"255,"`) and therefore cannot decode it.

## Root cause in code

In `src/app/api/tts/route.ts`, the cache-hit row is forced to the wrong runtime type:

```ts
.first<{ audio: ArrayBuffer }>()

return new Response(cached.audio as unknown as BodyInit, ...)
```

The production D1 BLOB result is a plain numeric array. Passing a plain array to `Response` invokes string conversion, producing `"255,243,100,..."`. The TypeScript assertion only hides the mismatch; it does not convert the value.

The cache-miss branch explicitly creates a `Uint8Array`, so it returns binary correctly:

```ts
const buffer = new Uint8Array(...)
return new Response(buffer as unknown as BodyInit, ...)
```

This means a new phrase may play on its first request, then fail on subsequent cache-hit requests. The warm-up script pre-populated the flashcard vocabulary, so common Luna word pronunciations such as `ambivalent` immediately take the broken cache-hit path.

## Why the UI fails silently

`src/hooks/use-speech.ts` accepts any `2xx` response as a `Blob`, creates an `<audio>` object, then does:

```ts
audio.play().catch(cleanup)
```

Because the endpoint says `audio/mpeg`, `fetchServerTts()` succeeds. MP3 decoding/playback later rejects, and `cleanup` clears state without surfacing an error. This exactly matches the visible behavior: click, then no sound and no message.

## Config and migration checks

- Root `wrangler.json` includes `ai.binding = "AI"` and D1 binding `DB`.
- The live request reached `tts_cache` and returned `X-TTS-Cache: hit`, proving the deployed root worker has DB access and migration `0006_tts_cache.sql` exists remotely.
- A `200` cache-hit response also rules out the suspected missing-table / missing-binding 502 path for the deployed `grad-exam-prep.vincent-xu-work.workers.dev` worker.
- The nested `env.production` block does not repeat the AI binding, which could matter only if deploying with `--env production` because Wrangler bindings are environment-specific. The screenshot URL is the root worker, and this is not the current incident.

## Recommended implementation fix

Normalize the D1 BLOB before constructing the response. At minimum, type the row as `number[]` and return a `Uint8Array`:

```ts
const cached = await env.DB
  .prepare('SELECT audio FROM tts_cache WHERE key = ?')
  .bind(key)
  .first<{ audio: number[] }>()

if (cached) {
  const bytes = Uint8Array.from(cached.audio)
  return new Response(bytes, { ... })
}
```

A defensive normalizer can also accept `ArrayBuffer` and `Uint8Array`, but production evidence confirms the cache-hit value currently arrives as `number[]`.

Existing cached rows do **not** need deletion: they contain the right numeric byte values. Only response conversion is wrong.

Recommended regression coverage:

1. Stub D1 `first()` to return `{ audio: [255, 243, ...] }`.
2. Assert the response `arrayBuffer()` contains those exact bytes, not UTF-8 for `"255,243,..."`.
3. Test a cache miss and immediate second cache hit return byte-identical bodies.

Optional UX hardening: validate the response body/audio decode and expose a playback error instead of silently clearing state, but this is secondary to fixing the route.

## Commands used

```sh
curl -sS -D /private/tmp/tts.headers -o /private/tmp/tts.body \
  -X POST 'https://grad-exam-prep.vincent-xu-work.workers.dev/api/tts' \
  -H 'content-type: application/json' \
  --data '{"text":"ambivalent","provider":"cloudflare","voice":"luna"}'

sed -n '1,100p' /private/tmp/tts.headers
wc -c /private/tmp/tts.body
file /private/tmp/tts.body
xxd -l 128 /private/tmp/tts.body

node -e "const fs=require('fs'); const s=fs.readFileSync('/private/tmp/tts.body','utf8'); const nums=s.split(',').map(Number); console.log({chars:s.length,values:nums.length,first16:nums.slice(0,16)}); console.log(Buffer.from(nums).subarray(0,32).toString('hex'))"
```
