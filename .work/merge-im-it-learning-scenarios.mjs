import fs from 'node:fs'

const [lessonFile, ...scenarioFiles] = process.argv.slice(2)
if (!lessonFile || scenarioFiles.length === 0) {
  throw new Error('Usage: node merge-im-it-learning-scenarios.mjs <lessons.json> <scenario.json...>')
}

const document = JSON.parse(fs.readFileSync(lessonFile, 'utf8'))
const lessonsById = new Map(document.lessons.map((lesson) => [lesson.id, lesson]))
const seen = new Set()

const normalizeScenario = (scenario) => ({
  title: scenario.title,
  hook: scenario.hook,
  predict: typeof scenario.predict === 'string' ? scenario.predict : scenario.predict.prompt,
  mapping: scenario.mapping.map((item) => ({
    everyday: item.everyday ?? item.scenarioElement,
    technical: item.technical ?? item.concept,
  })),
  boundary: scenario.boundary,
  examCues: scenario.examCues.map((cue) =>
    typeof cue === 'string' ? cue : `${cue.cue}：${cue.recall}`,
  ),
})

for (const scenarioFile of scenarioFiles) {
  const scenarios = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'))
  for (const [lessonId, scenario] of Object.entries(scenarios)) {
    if (seen.has(lessonId)) throw new Error(`duplicate scenario draft for ${lessonId}`)
    const lesson = lessonsById.get(lessonId)
    if (!lesson) throw new Error(`unknown lesson ${lessonId}`)
    if (lesson.learningScenario) throw new Error(`${lessonId} already has a scenario`)
    lesson.learningScenario = normalizeScenario(scenario)
    seen.add(lessonId)
  }
}

const remaining = document.lessons.filter((lesson) => !lesson.learningScenario).map((lesson) => lesson.id)
if (remaining.length) throw new Error(`missing scenarios: ${remaining.join(', ')}`)

fs.writeFileSync(lessonFile, `${JSON.stringify(document, null, 2)}\n`)
console.log(JSON.stringify({ merged: seen.size, total: document.lessons.length }))
