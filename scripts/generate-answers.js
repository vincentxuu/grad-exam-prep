export const meta = {
  name: 'generate-question-answers',
  description: 'Generate AI answers — each agent writes its own file, no large JSON passing',
  phases: [
    { title: 'Load', detail: 'Read question IDs for this batch' },
    { title: 'Generate', detail: 'Each agent reads question, writes answer file' },
  ],
}

// args = { start: number, end: number }
const { start = 700, end = 1424 } = args || {}

const QUESTIONS_PATH = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/questions.json'
const QFILES_DIR = '/Users/xiaoxu/Projects/grad-exam-prep/public/data/qfiles'
const ANSWERS_DIR = '/Users/xiaoxu/Projects/grad-exam-prep/tmp_answers_individual'

const IDS_SCHEMA = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: { type: 'array', items: { type: 'string' } },
  },
}

phase('Load')
const loadResult = await agent(
  `Run this bash command and return the result as structured JSON with an "ids" field:
node -e "const d=require('${QUESTIONS_PATH}'); console.log(JSON.stringify({ids:d.questions.slice(${start},${end}).map(q=>q.id)}))"`,
  { label: 'load-ids', schema: IDS_SCHEMA }
)

const questionIds = loadResult.ids
log(`Batch ${start}-${end}: ${questionIds.length} questions`)

phase('Generate')

await pipeline(
  questionIds,
  async (qId) => {
    await agent(
      `You are an expert in Taiwan graduate school entrance exams (資工所/資管所).

Step 1: Use the Read tool to read this file: ${QFILES_DIR}/${qId}.json

Step 2: Analyze the question content. Determine the single correct answer letter (A, B, C, D, or E) and write a 3-5 sentence explanation in Traditional Chinese (繁體中文).

Step 3: Use the Write tool to write the following JSON to: ${ANSWERS_DIR}/${qId}.json

The file must contain ONLY this JSON (replace ANSWER and EXPLANATION):
{"questionId":"${qId}","answer":"ANSWER","explanation":"EXPLANATION"}

Where ANSWER is exactly one letter (A/B/C/D/E) and EXPLANATION is your 3-5 sentence Traditional Chinese explanation. Do not include any other text in the file.`,
      { label: `ans:${qId}`, phase: 'Generate' }
    )
    return qId
  }
)

// Count how many files were written
const countResult = await agent(
  `Run this bash command and return the count as JSON {"count": N}:
node -e "const fs=require('fs'); const files=fs.readdirSync('${ANSWERS_DIR}').filter(f=>f.endsWith('.json')); console.log(JSON.stringify({count:files.length}))"`,
  { label: 'count-results', schema: { type: 'object', required: ['count'], properties: { count: { type: 'number' } } } }
)

log(`Batch ${start}-${end} done. Total answer files: ${countResult.count}`)
return { written: countResult.count }
