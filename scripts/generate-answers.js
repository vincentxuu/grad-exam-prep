export const meta = {
  name: 'generate-question-answers',
  description: 'Generate AI answers for exam questions (batched)',
  phases: [
    { title: 'Load', detail: 'Read question IDs for this batch' },
    { title: 'Generate', detail: 'Each agent reads its question file and generates answer' },
  ],
}

// args = { start: number, end: number }
// Processes questions[start..end) from questions.json
const { start = 0, end = 700 } = args || {}

const QUESTIONS_PATH = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/questions.json'
const QFILES_DIR = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/qfiles'
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
    answer: {
      type: 'string',
      enum: ['A', 'B', 'C', 'D', 'E'],
      description: 'The single correct option letter',
    },
    explanation: {
      type: 'string',
      description: '3-5 sentences in Traditional Chinese explaining why the answer is correct',
    },
  },
}

phase('Load')
const loadResult = await agent(
  `Run this bash command and return the IDs array as structured JSON:
node -e "const d=require('${QUESTIONS_PATH}'); const ids=d.questions.slice(${start},${end}).map(q=>q.id); console.log(JSON.stringify({ids}))"`,
  { label: 'load-ids', schema: IDS_SCHEMA }
)

const questionIds = loadResult.ids
log(`Batch ${start}-${end}: ${questionIds.length} questions`)

phase('Generate')

const results = await pipeline(
  questionIds,
  async (qId) => {
    const result = await agent(
      `You are an expert in Taiwan graduate school entrance exams (資工所/資管所).

Read the file at: ${QFILES_DIR}/${qId}.json

Use the Read tool to get the question content, then:
1. Identify the correct answer (must be exactly one of: A, B, C, D, E)
2. Write a clear 3-5 sentence explanation in Traditional Chinese (繁體中文)

You MUST call the StructuredOutput tool with your final answer and explanation.`,
      {
        label: `ans:${qId}`,
        phase: 'Generate',
        schema: ANSWER_SCHEMA,
      }
    )
    return result ? { questionId: qId, answer: result.answer, explanation: result.explanation } : null
  }
)

// Merge with existing answers.json
const existingAgent = await agent(
  `Read the file ${ANSWERS_PATH} and return its content as a plain string. Return ONLY the raw JSON, no explanation.`,
  { label: 'read-existing' }
)

let existing = { answers: {} }
try { existing = JSON.parse(existingAgent) } catch {}

let successCount = 0
let failCount = 0

for (const r of results) {
  if (!r) { failCount++; continue }
  existing.answers[r.questionId] = {
    questionId: r.questionId,
    answer: r.answer,
    explanation: r.explanation,
    generatedAt: 0,
  }
  successCount++
}

log(`Batch done: ${successCount} success, ${failCount} failed`)

// Write merged answers back
await agent(
  `Write the following JSON content to the file ${ANSWERS_PATH}. Use the Write tool. The content to write is exactly:
${JSON.stringify(existing, null, 2)}`,
  { label: 'write-answers' }
)

log(`Saved ${Object.keys(existing.answers).length} total answers to ${ANSWERS_PATH}`)
return { successCount, failCount, total: Object.keys(existing.answers).length }
