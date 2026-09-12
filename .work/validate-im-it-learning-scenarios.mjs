import fs from 'node:fs'

const file = process.argv[2] ?? 'public/data/im-it-lessons.json'
const document = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
const scenarioTitles = new Set()

for (const lesson of document.lessons) {
  const scenario = lesson.learningScenario
  if (!scenario) {
    errors.push(`${lesson.id}: missing learningScenario`)
    continue
  }

  for (const key of ['title', 'hook', 'predict', 'boundary']) {
    const minimumLength = key === 'title' ? 4 : 12
    if (typeof scenario[key] !== 'string' || scenario[key].trim().length < minimumLength) {
      errors.push(`${lesson.id}: ${key} is too short`)
    }
  }

  if (!Array.isArray(scenario.mapping) || scenario.mapping.length < 4 || scenario.mapping.length > 5) {
    errors.push(`${lesson.id}: mapping must contain 4-5 rows`)
  } else {
    for (const [index, mapping] of scenario.mapping.entries()) {
      if (!mapping.everyday?.trim() || !mapping.technical?.trim()) {
        errors.push(`${lesson.id}: mapping ${index + 1} is incomplete`)
      }
      if (mapping.everyday?.trim() === mapping.technical?.trim()) {
        errors.push(`${lesson.id}: mapping ${index + 1} does not translate the concept`)
      }
    }
  }

  if (!Array.isArray(scenario.examCues) || scenario.examCues.length !== 4) {
    errors.push(`${lesson.id}: examCues must contain exactly 4 cues`)
  }

  if (scenarioTitles.has(scenario.title)) {
    errors.push(`${lesson.id}: duplicated scenario title ${scenario.title}`)
  }
  scenarioTitles.add(scenario.title)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(
  JSON.stringify({
    lessons: document.lessons.length,
    scenarios: scenarioTitles.size,
    mappingRows: document.lessons.reduce(
      (total, lesson) => total + lesson.learningScenario.mapping.length,
      0,
    ),
    examCues: document.lessons.reduce(
      (total, lesson) => total + lesson.learningScenario.examCues.length,
      0,
    ),
  }),
)
