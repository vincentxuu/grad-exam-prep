#!/usr/bin/env node
/**
 * Page-verified repair for the remaining flagged IM English papers.
 *
 * Questions for 109, 111, and 112 are already the correct papers, but their
 * warning metadata is stale. The 111/112 answer records were never synchronized
 * after their questions were rebuilt, and two 111 passage excerpts were short.
 */

const fs = require('node:fs')
const path = require('node:path')

const DATA_DIR = path.join(__dirname, '../public/data')
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json')
const ANSWERS_PATH = path.join(DATA_DIR, 'answers.json')
const PAPERS_PATH = path.join(DATA_DIR, 'past-papers.json')
const QFILES_DIR = path.join(DATA_DIR, 'qfiles')

const questionData = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
const answerData = JSON.parse(fs.readFileSync(ANSWERS_PATH, 'utf8'))
const paperData = JSON.parse(fs.readFileSync(PAPERS_PATH, 'utf8'))

const keys = {
  'pp-im-en-109': 'AACCDBBDCABAABCBDCDDBDBAAACBCDCBDCADBABCBAADDBACDB',
  'pp-im-en-111': 'CABBADCADDABDCACABDCCADACDADBABBDCADACBCDCABDCDDCC',
  'pp-im-en-112': 'ABDADBCCDA DCABDDABCD ABDDCBBADC CBDCAADCDB DACACBAACD'.replace(/\s/g, ''),
}

// Keep the compact keys human-checkable and fail loudly if they are malformed.
function question(paperId, number) {
  const found = questionData.questions.find(
    (item) => item.paperId === paperId && item.number === number
  )
  if (!found) throw new Error('Missing ' + paperId + ' question ' + number)
  return found
}

function selectedChoice(text, letter) {
  const match = text.match(
    new RegExp('\\(' + letter + '\\)\\s*([\\s\\S]*?)(?=\\s*\\([A-D]\\)|$)', 'i')
  )
  return match ? match[1].replace(/\s+/g, ' ').trim() : ''
}

function setAnswer(paperId, number, letter, explanation) {
  const item = question(paperId, number)
  const answer = answerData.answers[item.id]
  if (!answer) throw new Error('Missing answer for ' + item.id)
  answer.answer = letter
  const choice = selectedChoice(item.text, letter)
  const readingStart = paperId === 'pp-im-en-111' ? 41 : 46
  const basis = number >= readingStart ? '依題組文章內容' : '依題目語意、固定搭配與文法'
  answer.explanation = explanation || basis + '，最符合的是 (' + letter + ') ' + choice + '。'
}

// Restore the two excerpts that remained shortened after the 111 rebuild.
const q11126 = question('pp-im-en-111', 26)
q11126.text = q11126.text.replace(
  '"It\'s far more coherent than any AI language system I\'ve ever tried."',
  "\"It's far more coherent than any AI language system I've ever tried. All you have to do is write a prompt and it'll add text it thinks would plausibly follow. I've gotten it to write songs, stories, press releases, guitar tabs, interviews, essays, technical manuals. It's hilarious and frightening. I feel like I've seen the future.\""
)

const q11131 = question('pp-im-en-111', 31)
q11131.text = q11131.text.replace(
  'the capacity to laugh at themselves.',
  'the capacity to launch self-deprecating jokes—a move that often undercuts any similar jokes lobbed at them.'
)

// 109 questions and explanations were already synchronized except these two.
setAnswer(
  'pp-im-en-109',
  16,
  'B',
  '此處是較正式的 “no ... but + finite verb” 結構，but 相當於 “that does not”。先行詞 success 為單數，因此應選 (B) comes。'
)
setAnswer(
  'pp-im-en-109',
  30,
  'D',
  '固定搭配 “iron out problems” 表示解決或排除問題；被動結構為 “problems need to be ironed out”，因此答案是 (D)。'
)

// The rebuilt 111 and 112 questions retained answer records from other papers.
for (const paperId of ['pp-im-en-111', 'pp-im-en-112']) {
  const key = keys[paperId]
  if (key.length !== 50) throw new Error('Expected a 50-letter key for ' + paperId)
  for (let number = 1; number <= 50; number++) {
    setAnswer(paperId, number, key[number - 1])
  }
}

setAnswer(
  'pp-im-en-111',
  43,
  'A',
  '文章說平台會鼓勵 radicalization 並放大文化中最有毒的力量，四個選項中只有 (A) polarization 符合這種分化作用。'
)
setAnswer(
  'pp-im-en-111',
  50,
  'C',
  '插在 [U] 後可先概括 Spence 運用大量史料記錄劇烈變動與傳統，再自然銜接下一句 “He noted” 所舉的具體歷史模式，因此選 (C)。'
)
setAnswer(
  'pp-im-en-112',
  32,
  'B',
  '考試慣用語序為 “Second in size only to the Louvre”，因此採 (B)。原卷的 (D) 在編輯過的散文中也可辯護，但不是此題預期的標準倒裝語序。'
)

for (const paperId of Object.keys(keys)) {
  const paper = paperData.papers.find((item) => item.id === paperId)
  if (!paper) throw new Error('Missing paper metadata for ' + paperId)
  delete paper.contentStatus
  delete paper.contentIssue
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questionData, null, 2) + '\n')
fs.writeFileSync(ANSWERS_PATH, JSON.stringify(answerData, null, 2) + '\n')
fs.writeFileSync(PAPERS_PATH, JSON.stringify(paperData, null, 2) + '\n')

for (const item of [q11126, q11131]) {
  const qfile = path.join(QFILES_DIR, item.id + '.json')
  if (fs.existsSync(qfile)) fs.writeFileSync(qfile, JSON.stringify(item, null, 2) + '\n')
}

process.stdout.write('✅ Repaired remaining IM English answers, passages, and statuses\n')
