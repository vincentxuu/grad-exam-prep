#!/usr/bin/env node
/**
 * 把既有英文閃卡的單字預先灌進詞條快取，讓考試高頻字第一天就是熱的。
 *
 * 用法：
 *   BASE_URL=https://<your-worker>.workers.dev \
 *   PASSPHRASE_HASH=<與 worker secret 相同的雜湊> \
 *   node scripts/warm-lexicon.js [--dry-run] [--limit N | --all]
 *
 * ── 為什麼不用 Batches API ────────────────────────────────────────────
 * 原本的計畫是用 Message Batches API（半價）。改成打已部署的
 * /api/lexicon，因為那樣就不必把 system prompt 與 JSON schema 複製一份
 * 到這支腳本裡 —— 複製出來的那份一定會跟 src/lib/lexicon/ 慢慢走鐘，
 * 而詞條品質正是這整個功能的重點。完整必要字庫有數千筆，因此預設只處理
 * 前 100 筆；明確傳入 --all 才會處理全部，避免意外產生大量費用。
 *
 * 順帶的好處：它直接暖的是線上那顆 D1，不是一個還要另外匯入的本地檔。
 */

const fs = require('node:fs')
const path = require('node:path')

const BASE_URL = process.env.BASE_URL
const PASSPHRASE_HASH = process.env.PASSPHRASE_HASH
const DRY_RUN = process.argv.includes('--dry-run')
const CONCURRENCY = 3

const limitFlag = process.argv.indexOf('--limit')
const LIMIT = process.argv.includes('--all')
  ? Infinity
  : limitFlag >= 0
    ? Number(process.argv[limitFlag + 1])
    : 100

/**
 * 與 src/lib/vocab.ts 的 extractWord 同一套規則。
 * 這裡只是抽字，不是生成邏輯，走鐘的代價僅止於少暖到幾個字。
 */
function extractWord(prompt) {
  const quoted = [...prompt.matchAll(/[「"“]([A-Za-z][A-Za-z\s'-]*?)["」”]/g)].map((m) =>
    m[1].trim()
  )
  if (quoted.length > 0) return quoted[0]

  const leading = prompt.match(/^([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z'-]+)*?)\s*[(（一-鿿]/)
  if (leading) return leading[1].trim()

  return null
}

function collectHeadwords() {
  const file = path.join(__dirname, '../public/data/flashcards.json')
  const cards = JSON.parse(fs.readFileSync(file, 'utf8'))
  const english = cards.filter((c) => c.subjectId.endsWith('-english'))

  const words = new Set()
  const skipped = []

  for (const card of english) {
    const word = card.headword || extractWord(card.prompt)
    if (word) {
      words.add(word.toLowerCase())
    } else {
      // 抽不出來的要講出來，不要默默吞掉
      skipped.push({ id: card.id, prompt: card.prompt.slice(0, 50) })
    }
  }

  return { words: [...words], skipped, total: english.length }
}

async function warmOne(term) {
  const res = await fetch(`${BASE_URL}/api/lexicon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PASSPHRASE_HASH}`,
    },
    body: JSON.stringify({ term }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${body.slice(0, 120)}`)
  }

  const data = await res.json()
  return { headword: data.entry?.headword ?? term, cached: data.cached?.entry === true }
}

async function main() {
  const { words, skipped, total } = collectHeadwords()
  const targets = words.slice(0, LIMIT)

  console.log(`英文閃卡 ${total} 張 → 抽出 ${words.length} 個不重複的字`)
  if (skipped.length > 0) {
    console.log(`抽不出單字的卡 ${skipped.length} 張：`)
    for (const s of skipped) console.log(`  ${s.id}  ${s.prompt}…`)
  }
  if (targets.length < words.length) {
    console.log(`--limit ${LIMIT}，這次只處理前 ${targets.length} 個`)
  }

  if (DRY_RUN) {
    console.log('\n--dry-run，不會真的呼叫 API。字表：')
    console.log(targets.join(', '))
    return
  }

  if (!BASE_URL || !PASSPHRASE_HASH) {
    console.error('\n缺少 BASE_URL 或 PASSPHRASE_HASH。加 --dry-run 可以先看字表。')
    process.exit(1)
  }

  let generated = 0
  let alreadyCached = 0
  const failures = []
  let cursor = 0

  async function worker() {
    while (cursor < targets.length) {
      const i = cursor++
      const term = targets[i]
      try {
        const r = await warmOne(term)
        if (r.cached) alreadyCached++
        else generated++
        process.stdout.write(`\r進度 ${i + 1}/${targets.length}  最新：${r.headword}          `)
      } catch (err) {
        failures.push({ term, message: err.message })
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log('\n')
  console.log(`新生成 ${generated} 筆`)
  console.log(`本來就在快取裡 ${alreadyCached} 筆`)
  console.log(`失敗 ${failures.length} 筆`)
  for (const f of failures) console.log(`  ${f.term}: ${f.message}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
