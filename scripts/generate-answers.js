export const meta = {
  name: 'generate-question-answers',
  description: 'Generate AI answers and explanations for all 1424 exam questions',
  phases: [
    { title: 'Load', detail: 'Read question IDs from disk' },
    { title: 'Generate', detail: 'Parallel AI answer generation per question' },
  ],
}

const QUESTIONS_PATH = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/questions.json'
const ANSWERS_PATH = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/answers.json'

const IDS_SCHEMA = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: { type: 'array', items: { type: 'string' } },
  },
}

const ANSWER_SCHEMA = {
  type: 'object',
  required: ['answer', 'explanation'],
  properties: {
    answer: { type: 'string', description: 'Correct option letter: A, B, C, D, or E' },
    explanation: { type: 'string', description: 'Clear 3-5 sentence explanation in Traditional Chinese (繁體中文)' },
  },
}

phase('Load')
const loadResult = await agent(
  `Run this bash command and return the result as structured JSON with an "ids" field containing the array:
node -e "const d=require('${QUESTIONS_PATH}'); console.log(JSON.stringify(d.questions.map(q=>q.id)))"`,
  { label: 'load-question-ids', schema: IDS_SCHEMA }
)

const questionIds = loadResult.ids
log(`Loaded ${questionIds.length} question IDs`)

phase('Generate')
log(`Starting generation for ${questionIds.length} questions...`)

const results = await pipeline(
  questionIds,
  async (qId) => {
    const result = await agent(
      `你是台灣研究所考試（資工所/資管所）解題專家。

執行此 bash 指令取得題目：
node -e "const d=require('${QUESTIONS_PATH}'); const q=d.questions.find(x=>x.id==='${qId}'); console.log(JSON.stringify(q))"

讀取題目內容後，判斷正確答案（A/B/C/D/E）並用繁體中文寫出 3-5 句解析。`,
      {
        label: `answer:${qId}`,
        phase: 'Generate',
        schema: ANSWER_SCHEMA,
      }
    )
    return result ? { questionId: qId, ...result } : null
  }
)

const answersMap = {}
let successCount = 0
let failCount = 0

for (const r of results) {
  if (!r) { failCount++; continue }
  answersMap[r.questionId] = {
    questionId: r.questionId,
    answer: r.answer,
    explanation: r.explanation,
    generatedAt: 0,
  }
  successCount++
}

log(`Done: ${successCount} success, ${failCount} failed`)

// Write answers.json via a save agent
await agent(
  `Write the following JSON to the file ${ANSWERS_PATH}. Use the Write tool to write this exact content:
${JSON.stringify({ answers: answersMap }, null, 2)}`,
  { label: 'save-answers' }
)

log(`Saved answers.json`)
return { successCount, failCount }
