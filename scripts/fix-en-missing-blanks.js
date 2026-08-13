#!/usr/bin/env node
// 資料修復：英文考卷填空題掉了的空格。
//
// 抽題時有一批題目的題幹空格被吃掉了，變成「The diplomat's negotiation skills were
// pivotal in a consensus among the warring factions.」這種讀起來像完整句子、
// 卻要你選一個字填進去的題目 —— 空格在哪看不出來，字彙／文法題就不成立。
//
// 影響範圍（本腳本處理的全部題目）：
//   pp-cs-en-113  第 1–17 題
//   pp-im-en-108  第 1 題
//   pp-im-en-110  第 1、2 題
//   pp-im-en-115  第 13、23 題
//
// ⚠️ 與本目錄其他重建腳本不同，這裡的空格位置不是從原始 PDF 轉錄來的（台大圖書館
// 網域在本工作環境被 egress policy 擋下，能解析 PDF 的擷取工具又需要授權）。
// 空格位置是依「句法上唯一可能的位置 ＋ 既有答案」反推出來的，題幹其餘文字一字未動。
// 日後取得原卷時建議再逐題對照一次。
//
// 反推過程中有兩題暴露出空格位置原本就被搬動過，不只是被吃掉：
//   cs-en-113 第 7 題答案是 fallacious（謬誤的），修飾的是 arguments 而不是
//     skepticism，因此空格在 The speaker's ___ arguments，不是 met with ___ skepticism。
//   cs-en-113 第 14 題答案是 who，先行詞是 director，原句應為
//     「The director, ___ presented the annual report, emphasized…」，
//     現有文字連 director 後面的逗號都掉了。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// paperId → { 題號: 補回空格後的題幹 }（選項行維持原樣不動）
const STEMS = {
  'pp-cs-en-113': {
    1: "The diplomat's negotiation skills were pivotal in ____ a consensus among the warring factions.",
    2: 'Her ability to remain calm and composed under pressure was truly ____.',
    3: 'The policy to impose new taxes sparked ____ among the citizens, leading to widespread protests.',
    4: "The CEO's announcement to downsize the company was met with ____ from employees who feared losing their jobs.",
    5: "His ____ approach to problem-solving often yielded innovative solutions that others hadn't considered.",
    6: 'The scarf is a perfect ____ to her outfit.',
    7: "The speaker's ____ arguments were met with skepticism from the audience, who demanded concrete evidence.",
    8: "The orchestra's performance was ____, leaving the audience in awe of their musical prowess.",
    9: 'As the new virus can be transmitted in the form of small liquid particles when people cough, sneeze, or speak, it is very difficult to ____ the spread of the disease in crowded places.',
    10: 'To ____ conversations about mental health and improve the psychological wellbeing of students, National Taiwan University passed a proposal for mental health leave last fall.',
    11: 'The weather was terrible, so Sarah decided to ____ her plans and stay indoors.',
    12: "I can't believe how much the company's profits ____ last year.",
    13: 'If he ____ the train, he would have missed the important meeting.',
    14: "The director, ____ presented the annual report, emphasized the center's achievements over the past year.",
    15: "It's high time we ____ for the event; we don't want to be late.",
    16: 'By next year, she ____ for this company for ten years.',
    17: "I'm looking forward to ____ you at the conference next week.",
  },
  'pp-im-en-108': {
    1: 'The fans complained about the apparently ____ distribution of tickets for the next game.',
  },
  'pp-im-en-110': {
    1: 'Even as COVID-19 treatments have improved and death rates have fallen, record-breaking levels of hospitalizations are already ____ ICUs in many parts of America.',
    2: 'Gestures that we use on a daily basis to portray positive emotion or agreement might mean something highly ____ in a foreign land.',
  },
  'pp-im-en-115': {
    13: 'The researcher was unable to ____ his claims without additional data.',
    23: 'If the university administration had implemented the new policy earlier, student dissatisfaction ____ alleviated to a large extent.',
  },
}

const questionsData = load('questions.json')

let fixed = 0
for (const [paperId, stems] of Object.entries(STEMS)) {
  const paper = questionsData.questions.filter((q) => q.paperId === paperId)
  if (!paper.length) throw new Error(`questions.json 找不到 ${paperId}`)

  for (const [number, stem] of Object.entries(stems)) {
    const question = paper.find((q) => q.number === Number(number))
    if (!question) throw new Error(`${paperId} 找不到第 ${number} 題`)

    const lines = question.text.split('\n')
    const optionIdx = lines.findIndex((l) => /^\s*\(?[A-D][\)\.]\s/.test(l))
    if (optionIdx === -1) throw new Error(`${paperId} 第 ${number} 題找不到選項行`)

    // 題幹可能帶著章節標頭（如 im-en-108 第 1 題），只換句子本體那一行，
    // 並保留原本的「1. 」題號前綴
    const head = lines.slice(0, optionIdx)
    const sentenceIdx = head.length - 1
    const prefix = head[sentenceIdx].match(/^\s*\d+\.\s*/)?.[0] ?? ''
    head[sentenceIdx] = `${prefix}${stem}`

    const next = [...head, ...lines.slice(optionIdx)].join('\n')
    if (next !== question.text) {
      question.text = next
      fixed++
    }
  }
}

// 每一題都要真的有空格了才寫檔
const missing = []
for (const [paperId, stems] of Object.entries(STEMS)) {
  for (const number of Object.keys(stems)) {
    const question = questionsData.questions.find(
      (q) => q.paperId === paperId && q.number === Number(number)
    )
    if (!/_{2,}/.test(question.text)) missing.push(`${paperId}#${number}`)
  }
}
if (missing.length) throw new Error(`還有題目沒有空格：${missing.join(', ')}`)

save('questions.json', questionsData)

const total = Object.values(STEMS).reduce((sum, s) => sum + Object.keys(s).length, 0)
console.log(`補回填空空格：${fixed} 題有變動（涵蓋 ${total} 題）`)
