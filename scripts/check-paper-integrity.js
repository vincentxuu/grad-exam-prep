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

const problems = []

// ---------------------------------------------------------------- 1. 跨卷重複

// 制式的作答說明會在各年重複出現，比對前先把它們從題首剝掉
const INSTRUCTION_RE =
  /^(?:[IVX]+\.|Part\s+[IVX]+[.:]|Section\s+[IVX]+\.)?\s*(?:Vocabulary|Grammar|Cloze|Close|Reading|Contextual|Academic)[^\n]*\n/i

const MIN_COMPARE_LENGTH = 60

function fingerprint(text) {
  return text
    .replace(INSTRUCTION_RE, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
    .slice(0, 100)
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

const paperIds = [...new Set(questions.map((q) => q.paperId))]
for (const paperId of paperIds) {
  const paper = questions.filter((q) => q.paperId === paperId)

  // 這份卷子裡所有「帶題組標頭」的題號範圍
  const covered = []
  for (const q of paper) {
    const m = q.text.match(PASSAGE_RANGE_RE)
    if (m) covered.push([Number(m[1]), Number(m[2])])
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
}

// ---------------------------------------------------------------- 輸出

console.log(`📄 檢查 ${paperIds.length} 份考卷、${questions.length} 題\n`)

if (problems.length === 0) {
  console.log('✅ 沒有發現跨卷重複、缺文章或題號斷層')
  process.exit(0)
}

console.log(`❌ 發現 ${problems.length} 個問題：`)
for (const p of problems) console.log(`  - ${p}`)
process.exit(1)
