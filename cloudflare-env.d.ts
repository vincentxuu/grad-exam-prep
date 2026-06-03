/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database
  ASSETS: Fetcher
  PASSPHRASE_HASH: string
}
