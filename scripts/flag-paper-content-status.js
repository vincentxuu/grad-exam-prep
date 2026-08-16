#!/usr/bin/env node
// 把已知有問題的考卷標記出來，讓 app 能把它們排除在練習之外。
//
// 這批問題都源自最初一次性匯入題庫的那個 commit（e570124）—— 逐份讀 PDF、
// 沒有校驗，於是各自壞在不同地方。壞法有三種，其中「題數對但內容不對」這種
// 一直沒被發現，因為卷面 50 題齊、每題都有答案與詳解，列表頁看起來完全正常。
//
// 內容要修好得拿原始 PDF 重抽（見 past-papers.json 各卷的 url），在那之前先讓
// 壞資料在介面上看得出來，並且不要進模擬考 —— 練到錯的選項比沒練更糟。
//
// 用法：node scripts/flag-paper-content-status.js

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')
const file = path.join(dataDir, 'past-papers.json')

const FLAGS = {
  'pp-im-en-109': {
    contentStatus: 'suspect',
    contentIssue:
      '與 112 年英文卷有 32 題完全相同（題號也對得上），兩份之中必有一份裝了另一份的內容，尚未取得原始 PDF 判定是哪一份。',
  },
  'pp-im-en-111': {
    contentStatus: 'suspect',
    contentIssue:
      '第 1–20、42–50 共 28 題與資工所 110 年英文(A) 相同 —— 那份已依原卷重建過，所以是這份裝錯了。第 21–40 題的克漏字文章也沒抽進來，只留下摘要式的佔位文字。',
  },
  'pp-im-en-112': {
    contentStatus: 'suspect',
    contentIssue:
      '與 109 年英文卷有 32 題完全相同（題號也對得上），兩份之中必有一份裝了另一份的內容，尚未取得原始 PDF 判定是哪一份。',
  },
  // pp-im-en-113 一度被列為存疑（第 11–40 題只有三個選項），後來確認那是誤判：
  // pp-cs-en-110 是照原卷重建的，它的 Structure 段同樣只有三個選項 —— 台大英文卷
  // 確實有三選項的段落，而 113 的選項數是乾淨的 10/30/10 分段，不是抽題掉字。
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'))

let changed = 0
for (const paper of data.papers) {
  const flag = FLAGS[paper.id]
  if (!flag) {
    // 先前標過、現在已經修好的卷子要能被清掉，否則警告會永遠掛著
    if (paper.contentStatus) {
      delete paper.contentStatus
      delete paper.contentIssue
      changed++
    }
    continue
  }
  paper.contentStatus = flag.contentStatus
  paper.contentIssue = flag.contentIssue
  changed++
}

const missing = Object.keys(FLAGS).filter((id) => !data.papers.some((p) => p.id === id))
if (missing.length) {
  console.error(`❌ past-papers.json 找不到這些卷子：${missing.join(', ')}`)
  process.exit(1)
}

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
console.log(`✅ 已更新 ${changed} 份考卷的 contentStatus`)
