#!/usr/bin/env node
/**
 * Authoritative, idempotent repair for pp-im-en-106.
 *
 * The original import dropped passage text and generated some reading answers
 * without context. This script repairs the consolidated data and its qfile
 * mirrors without depending on lossy OCR output.
 */

const fs = require('node:fs')
const path = require('node:path')

const DATA_DIR = path.join(__dirname, '../public/data')
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json')
const ANSWERS_PATH = path.join(DATA_DIR, 'answers.json')
const PAPERS_PATH = path.join(DATA_DIR, 'past-papers.json')
const QFILES_DIR = path.join(DATA_DIR, 'qfiles')
const PAPER_ID = 'pp-im-en-106'

const questionData = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
const answerData = JSON.parse(fs.readFileSync(ANSWERS_PATH, 'utf8'))
const paperData = JSON.parse(fs.readFileSync(PAPERS_PATH, 'utf8'))

function getQuestion(number) {
  const question = questionData.questions.find(
    (item) => item.paperId === PAPER_ID && item.number === number
  )
  if (!question) throw new Error('Missing ' + PAPER_ID + ' question ' + number)
  return question
}

function setAnswer(number, answer, explanation) {
  const question = getQuestion(number)
  const entry = answerData.answers[question.id]
  if (!entry) throw new Error('Missing answer for ' + question.id)
  entry.answer = answer
  entry.explanation = explanation
}

function insertAfter(text, anchor, addition) {
  if (text.includes(addition.trim())) return text
  if (!text.includes(anchor)) throw new Error('Missing insertion anchor: ' + anchor)
  return text.replace(anchor, anchor + addition)
}

// Q13 is malformed in the source scan: bare "even" cannot introduce a clause.
// Normalize the evident typo to "even though" while keeping the intended A key.
getQuestion(13).text = [
  "Vincent Van Gogh's rise to posthumous fame as one of the world's great artists came ____ he scarcely sold a single painting during his lifetime.",
  '(A) even though (B) in spite (C) despite that (D) however',
].join('\n')

const q21 = getQuestion(21)
if (!q21.text.includes('As early as the American Revolution')) {
  q21.text = insertAfter(
    q21.text,
    'games originating in England.',
    ' As early as the American Revolution, it was noted that troops played "base ball" in their free time.'
  )
}
q21.text = q21.text.replace(
  'three outs per __23__, a nine man team. three outs per __23__, a nine man team.',
  'three outs per __23__, a nine-man team.'
)
q21.text = q21.text.replace('diamond shaped infield', 'diamond-shaped infield')

const q27 = getQuestion(27)
q27.text = q27.text.replace(
  'the rapid growth of cities, __29__ then by reactions of horror to World War I. the rapid growth of cities, __29__ then by reactions of horror to World War I.',
  'the rapid growth of cities, __29__ then by reactions of horror to World War I.'
)
q27.text = q27.text.replace(
  'were becoming ill-fitted to their tasks and __31__ in the new economic, social, and political environment of an emerging, fully industrialized world. were becoming ill-fitted to their tasks and __31__ in the new economic, social, and political environment of an emerging, fully industrialized world.',
  'were becoming ill-fitted to their tasks and __31__ in the new economic, social, and political environment of an emerging, fully industrialized world.'
)

let q33Text = getQuestion(33).text.replace(
  'Vader led an attack on a __34__ Rebel vessel, seeking to recover the stolen plans and find the location of the Rebel base. Vader led an attack on a __34__ Rebel vessel, seeking to recover the stolen plans and find the location of the Rebel base.',
  'Vader led an attack on a __34__ Rebel vessel, seeking to recover the stolen plans and find the location of the Rebel base.'
)
q33Text = insertAfter(
  q33Text,
  'R2-D2, __35__ him to Tatooine in search of Obi-Wan Kenobi.',
  ' Vader and his stormtroopers killed all aboard with the exception of the Princess,'
)
q33Text = insertAfter(
  q33Text,
  'Luke Skywalker, Han Solo, Chewbacca, and C-3PO.',
  ' Vader and Obi-Wan clashed one last time, with the Sith Lord striking down his former Master. Luke, Leia, and the heroes were able to escape, but only because the Empire allowed it:'
)
q33Text = insertAfter(
  q33Text,
  "which led the Empire to the Rebel's secret base.",
  ' As the Death Star closed in, the Rebels mounted an attack, with Vader himself entering the fray in his TIE Advanced starfighter.'
)
q33Text = insertAfter(
  q33Text,
  'Vader and his wingmen were attacked from behind by the Millennium Falcon.',
  ' Ricocheted away from the Death Star and spun out of control, Vader was unable to stop Luke.'
)
getQuestion(33).text = q33Text

const q41 = getQuestion(41)
q41.text = q41.text
  .replace(
    ' n    t       l      s   nn  t    n',
    'day I want to renew myself. No day set aside for rest. I choose my pauses myself, when I feel drunk with the intensity of life and I'
  )
  .replace('That is nauseating:', 'That is nauseating.')

const q46 = getQuestion(46)
q46.text = q46.text
  .replace('lone bedroom wall', 'one bedroom wall')
  .replace(/\bmpressionable\b/, 'impressionable')
  .replace('land “the allies.', 'and “the allies.')
  .replace('łtones', 'tones')

setAnswer(
  13,
  'A',
  '原卷把選項 (A) 誤印為 bare “even”，但空格後是完整子句，標準英文應為 “even though”。本題依此勘誤作答為 (A)：儘管梵谷生前幾乎沒有賣出畫作，他死後仍聲名大噪。'
)
setAnswer(
  41,
  'B',
  '作者兩度直接說 “That’s why I hate New Year’s”，全文也都在反對被固定日期支配，因此最貼切的標題是 (B) “I Hate New Year’s Day.”'
)
setAnswer(
  46,
  'C',
  '開頭的 “little thought”、 “beyond expectation” 與 “beyond conception” 都表示作者未曾料到自己會受邀到斯德哥爾摩，因此答案是 (C) expressing surprise。'
)
setAnswer(
  47,
  'A',
  '文中的 “den-life”、 “doze of hibernation”、 “in suspension” 與 “torpid” 都描寫封閉、沉睡般的童年氛圍，因此答案是 (A) dormant。'
)
setAnswer(
  49,
  'B',
  '作者明示童年在 1940 年代，廣播內容又包括轟炸機、遭轟炸城市、戰線、敵軍與盟軍，因此所指的是 (B) World War II。'
)

const paper = paperData.papers.find((item) => item.id === PAPER_ID)
if (!paper) throw new Error('Missing paper metadata for ' + PAPER_ID)
delete paper.contentStatus
delete paper.contentIssue

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questionData, null, 2) + '\n')
fs.writeFileSync(ANSWERS_PATH, JSON.stringify(answerData, null, 2) + '\n')
fs.writeFileSync(PAPERS_PATH, JSON.stringify(paperData, null, 2) + '\n')

for (const question of questionData.questions.filter((item) => item.paperId === PAPER_ID)) {
  const qfile = path.join(QFILES_DIR, question.id + '.json')
  if (fs.existsSync(qfile)) {
    fs.writeFileSync(qfile, JSON.stringify(question, null, 2) + '\n')
  }
}

process.stdout.write('✅ Repaired pp-im-en-106 passages, answers, qfiles, and paper status\n')
