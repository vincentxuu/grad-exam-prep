#!/usr/bin/env node
// One-off data repair: 資管所的「資訊管理導論」與「統計學」在台大圖書館是同一份 PDF，
// 抽題時整份卷子被寫進兩個科目，導致 im-mis / im-stat 各持有一份完全相同的 42 題。
//
// 修正方式：
//   1. 114/115 年的題目帶有卷內 section 標記（[統計學] / [Section: 統計 (Statistics)]），
//      依標記把題目留在正確的科目，刪掉錯置的那一份，並把標記從題目內文移除。
//   2. 106–113 年尚未設統計筆試科目，抽出的題目全是 MIS（配分加總已達 100），
//      因此 im-stat 的複本整批刪除，past-papers 的來源標記一併更正為不適用。
//   3. answers.json / question-images.json 中指向被刪題目的項目一併清除。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// 卷內 section 標記，例如：
//   "[資訊管理導論] Question 1\n\n…"
//   "[Section: 統計 (Statistics)]\n\n…"
const SECTION_RE =
  /^\[(?:Section:\s*)?(資訊管理導論|統計學|統計)(?:\s*\([^)]*\))?\]\s*(?:Question\s*\d+)?\s*\n+/

function classify(text) {
  const m = text.match(SECTION_RE)
  if (!m) return null
  return m[1] === '資訊管理導論' ? 'im-mis' : 'im-stat'
}

function stripSection(text) {
  return text.replace(SECTION_RE, '')
}

const questionsData = load('questions.json')
const answersData = load('answers.json')
const images = load('question-images.json')

const questions = questionsData.questions
const mis = questions.filter((q) => q.subjectId === 'im-mis')
const stat = questions.filter((q) => q.subjectId === 'im-stat')

// 兩份必須是同一批題目才適用本腳本
const key = (q) => `${q.year}-${q.number}`
const misKeys = new Set(mis.map(key))
const statKeys = new Set(stat.map(key))
if (mis.length !== stat.length || [...misKeys].some((k) => !statKeys.has(k))) {
  console.error('❌ im-mis 與 im-stat 不是成對的複本，請先人工確認資料狀態')
  process.exit(1)
}

// 依 section 標記決定每一題的歸屬；沒有標記的一律視為 MIS
const ownerByKey = new Map()
for (const q of mis) ownerByKey.set(key(q), classify(q.text) ?? 'im-mis')

const removedIds = new Set()
const kept = []

for (const q of questions) {
  if (q.subjectId !== 'im-mis' && q.subjectId !== 'im-stat') {
    kept.push(q)
    continue
  }
  if (ownerByKey.get(key(q)) !== q.subjectId) {
    removedIds.add(q.id)
    continue
  }
  kept.push({ ...q, text: stripSection(q.text) })
}

questionsData.questions = kept
questionsData.totalQuestions = kept.length

// 清掉指向已刪題目的答案與圖片
let removedAnswers = 0
for (const id of Object.keys(answersData.answers)) {
  if (removedIds.has(id)) {
    delete answersData.answers[id]
    removedAnswers++
  }
}
let removedImages = 0
for (const id of Object.keys(images)) {
  if (removedIds.has(id)) {
    delete images[id]
    removedImages++
  }
}

// 統計卷實際存在於合科 PDF 的年份
const statYearsWithQuestions = new Set(
  kept.filter((q) => q.subjectId === 'im-stat').map((q) => q.year)
)

// past-papers.json 是人工排版的（一筆一行、依年份空行分組），逐行改寫以保留格式
const papersPath = path.join(dataDir, 'past-papers.json')
const papersText = fs.readFileSync(papersPath, 'utf8')

// 單行序列化，比照檔案既有風格：{"id": "…", "examId": "…"}
function inlineJson(obj) {
  const body = Object.entries(obj)
    .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(', ')
  return `{${body}}`
}

const nextPapersText = papersText
  .split('\n')
  .map((line) => {
    if (!line.includes('"id": "pp-im-stat-')) return line
    const start = line.indexOf('{')
    const end = line.lastIndexOf('}')
    const trailing = line.slice(end + 1)
    const paper = JSON.parse(line.slice(start, end + 1))

    if (statYearsWithQuestions.has(paper.year)) {
      paper.note = '與資訊管理導論合併為同一份考卷'
    } else {
      // 106–113 年官方索引沒有統計筆試科目，不存在可另外取得的統計卷
      paper.url = null
      paper.verified = false
      paper.note = '該年度招生筆試尚未設統計考科，因此沒有統計題卷（統計自 114 學年度起納入）'
    }
    return line.slice(0, start) + inlineJson(paper) + trailing
  })
  .join('\n')

save('questions.json', questionsData)
save('answers.json', answersData)
save('question-images.json', images)
fs.writeFileSync(papersPath, nextPapersText)

const finalMis = kept.filter((q) => q.subjectId === 'im-mis').length
const finalStat = kept.filter((q) => q.subjectId === 'im-stat').length
console.log(
  `✅ 移除 ${removedIds.size} 題錯置複本（答案 ${removedAnswers}、圖片 ${removedImages}）`
)
console.log(`   im-mis: ${mis.length} → ${finalMis}`)
console.log(`   im-stat: ${stat.length} → ${finalStat}`)
console.log(`   統計題實際存在的年份: ${[...statYearsWithQuestions].sort().join(', ') || '（無）'}`)
