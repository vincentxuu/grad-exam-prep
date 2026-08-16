#!/usr/bin/env node
// 考卷完整性檢查：抓「抽題抓錯 PDF」與「文章沒抽進來」這兩類錯誤。
//
// 這兩類問題已經在 pp-cs-en-109／112、pp-cs-arch-108、pp-cs-algo-112、pp-cs-en-110、
// im-mis／im-stat 上各出現過一次，而且從資料表面完全看不出來 —— 題數是對的、
// 每題也都有解答，只是內容根本不屬於那份卷子。所以把當初的判讀方法寫成腳本。
//
// 檢查項目：
//   1. 跨卷重複：同一段題目文字出現在兩份不同考卷 —— 必有一份裝錯內容。
//      作答說明（Vocabulary (40%): Choose the word…）這類制式文字各年重複是正常的，
//      因此比對時只取題目「去掉開頭說明後」的內容，且要求長度足夠才納入比對。
//   2. 缺文章：題目自稱屬於某篇文章（Passage / Article / blank N），
//      但同一份卷子裡找不到帶「Questions M-N」標頭的題組母題 ——
//      這種題目在 app 上會變成沒有文章可讀的孤兒題。
//   3. 題號斷層：同一份卷子的題號不連續。
//
// 用法：node scripts/check-paper-integrity.js  （有問題時 exit 1）

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')
const questions = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'questions.json'), 'utf8')
).questions
const answers = JSON.parse(fs.readFileSync(path.join(dataDir, 'answers.json'), 'utf8')).answers

const problems = []

// ---------------------------------------------------------------- 1. 跨卷重複

// 制式的作答說明會在各年重複出現，比對前先把它們從題首剝掉
const INSTRUCTION_RE =
  /^(?:[IVX]+\.|Part\s+[IVX]+[.:]|Section\s+[IVX]+\.)?\s*(?:Vocabulary|Grammar|Cloze|Close|Reading|Contextual|Academic)[^\n]*\n/i

const MIN_COMPARE_LENGTH = 60

function fingerprint(text) {
  return (
    text
      .replace(INSTRUCTION_RE, '')
      // Compare the whole normalized question. The old fingerprint kept only the first
      // 100 letters, so questions that shared a template collided even when their
      // recurrence signs, coefficients, or actual requested operations differed.
      .replace(/[^a-zA-Z0-9+\-=^]/g, '')
      .toLowerCase()
  )
}

const byFingerprint = new Map()
for (const q of questions) {
  const key = fingerprint(q.text)
  if (key.length < MIN_COMPARE_LENGTH) continue
  if (!byFingerprint.has(key)) byFingerprint.set(key, [])
  byFingerprint.get(key).push(q)
}

const crossPaperPairs = new Map()
for (const group of byFingerprint.values()) {
  const papers = [...new Set(group.map((q) => q.paperId))]
  if (papers.length < 2) continue
  const key = papers.sort().join(' ↔ ')
  crossPaperPairs.set(key, (crossPaperPairs.get(key) ?? 0) + 1)
}

for (const [pair, count] of [...crossPaperPairs].sort((a, b) => b[1] - a[1])) {
  problems.push(`跨卷重複：${pair} 有 ${count} 題內容相同 —— 必有一份裝了別份卷子的內容`)
}

// ---------------------------------------------------------------- 2. 缺文章

const PASSAGE_RANGE_RE = /[Qq]uestions?\s+(\d+)\s*[-–—]+\s*(\d+)/
// 自稱屬於某篇文章的題目。
// 「Passage A」「Article 1」的編號一定是大寫字母或數字，因此這段不能用 i 旗標 ——
// 否則 "the article was relegated" 這種普通句子也會被當成指向文章。
const REFERS_TO_PASSAGE_RE = /\b(?:Passage|Article)\s+(?:[A-Z]|\d|[IVX]+)\b|\bblank\s*\(?\d+\)?/
const REFERS_TO_PASSAGE_CI_RE =
  /according to (?:the|this) (?:article|passage)|in the (?:first|second|third|last) paragraph/i
const refersToPassage = (text) =>
  REFERS_TO_PASSAGE_RE.test(text) || REFERS_TO_PASSAGE_CI_RE.test(text)

// 抽題時模型自己加的中括號註記，用來代替沒抄進來的文章
const PLACEHOLDER_RE =
  /\[(?:Passage[^\]]*|Cloze passage[^\]]*|Reading passage[^\]]*|Question \d+ blank)\]/

const MIN_AVG_LENGTH = 250

// 選項檢查只對選擇題卷有意義 —— 資工的演算法、數學卷是計算與證明題
const isMultipleChoicePaper = (paperId) => paperId.includes('-en-')

// 兩種寫法都要認：括號式 (A) / (a)，以及只有右括號的 a)。
// 括號式不能要求前面是空白 —— 「22.(A) in」這種黏在題號後面的寫法很常見。
function optionLetters(text) {
  const letters = new Set()
  for (const m of text.matchAll(/\(([A-Ea-e])\)/g)) letters.add(m[1].toLowerCase())
  for (const m of text.matchAll(/(?:^|[\s\n])([A-Ea-e])\)\s/g)) letters.add(m[1].toLowerCase())
  return letters
}

// 有些卷子不寫「Questions 21-25」，而是直接把文章掛在題組第一題、以「Passage A:」
// 開頭（例如 pp-im-en-108）。這種也算文章有抽進來，否則整份卷子會被誤報。
// 要求冒號與足夠長度 —— 只寫「[Passage I Cloze]」這種註記不算，那正是要抓的東西。
const PASSAGE_HEADER_RE = /\bPassage\s+(?:[A-Z]|\d|[IVX]+)\s*[::]/
const PASSAGE_MIN_LENGTH = 400
const carriesPassage = (q) => q.text.length >= PASSAGE_MIN_LENGTH && PASSAGE_HEADER_RE.test(q.text)

const paperIds = [...new Set(questions.map((q) => q.paperId))]
for (const paperId of paperIds) {
  const paper = questions.filter((q) => q.paperId === paperId)
  const lastNumber = Math.max(...paper.map((q) => q.number))

  // 這份卷子裡所有「帶題組標頭」的題號範圍
  const covered = []
  for (const q of paper) {
    const m = q.text.match(PASSAGE_RANGE_RE)
    if (m) covered.push([Number(m[1]), Number(m[2])])
  }

  // 夾帶文章的題目，涵蓋自己到下一篇文章出現之前
  const carriers = paper.filter(carriesPassage).sort((a, b) => a.number - b.number)
  for (const [i, q] of carriers.entries()) {
    const next = carriers[i + 1]
    covered.push([q.number, next ? next.number - 1 : lastNumber])
  }

  const orphans = paper
    .filter((q) => refersToPassage(q.text))
    .filter((q) => !covered.some(([start, end]) => q.number >= start && q.number <= end))
    .map((q) => q.number)

  if (orphans.length) {
    problems.push(
      `缺文章：${paperId} 第 ${orphans.join(', ')} 題指向某篇文章，但卷內沒有對應的題組（文章沒被抽進來）`
    )
  }

  // ------------------------------------------------------------ 3. 題號斷層
  // 只看「中間」的斷層。開頭缺號是正常的 —— 有些卷子與別科共用同一份 PDF
  // （例如 im-mis／im-stat），拆開後留下來的題目本來就從中間的題號開始。
  const numbers = paper.map((q) => q.number).sort((a, b) => a - b)
  const gaps = []
  for (let i = numbers[0]; i <= numbers[numbers.length - 1]; i++) {
    if (!numbers.includes(i)) gaps.push(i)
  }
  if (gaps.length) {
    problems.push(`題號斷層：${paperId} 缺第 ${gaps.join(', ')} 題（共 ${paper.length} 題）`)
  }

  // ------------------------------------------------------- 4. 佔位註記
  // 抽題時模型沒有照抄文章，改成「每題寫一行、後面補個中括號說它屬於哪篇」。
  // 這種卷子題數是齊的、每題也都有答案，從列表頁完全看不出來 ——
  // pp-im-en-106（30 處）與 pp-im-en-111（38 處）就是這樣撐到被人工發現為止。
  const placeholders = paper.filter((q) => PLACEHOLDER_RE.test(q.text)).map((q) => q.number)
  if (placeholders.length) {
    problems.push(
      `佔位註記：${paperId} 第 ${placeholders.join(', ')} 題含 [Passage …] 這類中括號註記 —— 文章多半沒抽進來，只留下摘要`
    )
  }

  // ------------------------------------------------------- 5. 答案指向不存在的選項
  // 選擇題被吃掉一個選項，作答時完全看不出來 —— 少一個選項也能選、也會判對錯。
  //
  // 這裡刻意「不」用「選項少於四個就報」當條件：pp-cs-en-110 是照原卷重建過的，
  // 它的 Structure 段（11–20 題）本來就只有三個選項，台大英文卷確實有這種段落。
  // 能證明有東西掉了的，是答案指向一個卷面上不存在的選項。
  if (isMultipleChoicePaper(paperId)) {
    const contradictions = paper
      .filter((q) => {
        const options = optionLetters(q.text)
        if (options.size < 2) return false
        const letter = answers[q.id]?.answer?.trim().toLowerCase()
        return letter?.length === 1 && !options.has(letter)
      })
      .map((q) => q.number)
    if (contradictions.length) {
      problems.push(
        `答案對不上選項：${paperId} 第 ${contradictions.join(', ')} 題的答案不在卷面選項裡 —— 該選項抽題時掉了`
      )
    }
  }

  // ------------------------------------------------------- 6. 篇幅過短
  // 前面幾項都是抓特徵，這項是抓「總量不對」：英文卷的克漏字與閱讀文章佔掉大半
  // 篇幅，平均字數掉到這個水線以下，通常代表文章根本沒進來。
  if (isMultipleChoicePaper(paperId)) {
    const avg = Math.round(paper.reduce((s, q) => s + q.text.length, 0) / paper.length)
    if (avg < MIN_AVG_LENGTH) {
      problems.push(
        `篇幅過短：${paperId} 平均每題只有 ${avg} 字（門檻 ${MIN_AVG_LENGTH}）—— 文章可能沒抽進來`
      )
    }
  }
}

// ---------------------------------------------------------------- 輸出
//
// 已知還沒修好的問題記在 baseline 裡，CI 只擋「新出現的」——
// 否則這支腳本從第一天起就是紅的，紅久了就沒有人看，等於沒有這道關卡。
// 修好一項就從 baseline 移掉（`--update-baseline` 會重寫整份）。

const baselineFile = path.join(__dirname, 'paper-integrity-baseline.json')

if (process.argv.includes('--update-baseline')) {
  fs.writeFileSync(baselineFile, `${JSON.stringify({ known: problems.sort() }, null, 2)}\n`)
  console.log(`✅ baseline 已更新為目前的 ${problems.length} 個問題`)
  process.exit(0)
}

const baseline = fs.existsSync(baselineFile)
  ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')).known
  : []

console.log(`📄 檢查 ${paperIds.length} 份考卷、${questions.length} 題\n`)

const fresh = problems.filter((p) => !baseline.includes(p))
const fixed = baseline.filter((p) => !problems.includes(p))
const remaining = problems.length - fresh.length

if (fixed.length) {
  console.log(`🎉 baseline 裡有 ${fixed.length} 項已經不再出現，請從 baseline 移除：`)
  for (const p of fixed) console.log(`  - ${p}`)
  console.log()
}

if (remaining) {
  console.log(`📋 已知待修 ${remaining} 項（記在 ${path.basename(baselineFile)}）：`)
  for (const p of problems.filter((x) => baseline.includes(x))) console.log(`  - ${p}`)
  console.log()
}

if (fresh.length === 0) {
  console.log('✅ 沒有新增的問題')
  process.exit(0)
}

console.log(`❌ 新增 ${fresh.length} 個問題：`)
for (const p of fresh) console.log(`  - ${p}`)
process.exit(1)
