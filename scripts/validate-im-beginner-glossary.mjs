import fs from 'node:fs'

function read(relativePath) {
  return JSON.parse(fs.readFileSync(relativePath, 'utf8'))
}

const glossary = read('public/data/im-beginner-glossary.json')
const lessonFiles = {
  'im-it': 'public/data/im-it-lessons.json',
  'im-mis': 'public/data/im-mis-lessons.json',
  'im-stat': 'public/data/im-stat-lessons.json',
}
const errors = []
const require = (condition, message) => {
  if (!condition) errors.push(message)
}

require(glossary.schemaVersion === 1, 'unsupported schemaVersion')
require(glossary.contentStatus === 'reviewed', 'glossary must be reviewed')
require(glossary.review?.reviewedBy && glossary.review?.reviewedAt, 'missing named review evidence')
require(glossary.totalTerms === glossary.terms.length, 'totalTerms does not match terms')

const termIds = new Set()
const coverage = new Map()
const lessonById = new Map()

for (const [subjectId, file] of Object.entries(lessonFiles)) {
  const lessonArtifact = read(file)
  const lessons = lessonArtifact.lessons
  require(lessonArtifact.counts.lessons ===
    lessons.length, `${subjectId}: declared ${lessonArtifact.counts.lessons} lessons, found ${lessons.length}`)
  for (const lesson of lessons) {
    lessonById.set(lesson.id, { subjectId, text: JSON.stringify(lesson).toLowerCase() })
    coverage.set(lesson.id, [])
  }
}

for (const term of glossary.terms) {
  require(!termIds.has(term.id), `${term.id}: duplicate term ID`)
  termIds.add(term.id)
  require(lessonFiles[term.subjectId], `${term.id}: unknown subject ${term.subjectId}`)
  require(term.reviewStatus === 'reviewed', `${term.id}: term is not reviewed`)
  require(Array.isArray(term.aliases), `${term.id}: aliases must be an array`)
  require(new Set(term.aliases).size === term.aliases.length, `${term.id}: duplicate aliases`)
  require(term.plainDefinition?.length >= 8, `${term.id}: definition is too short`)
  require(term.plainDefinition?.length <=
    160, `${term.id}: definition is too long for a beginner card`)
  require(term.everydayExample?.length >= 8, `${term.id}: everyday example is too short`)
  require(term.confusionNote?.length >= 8, `${term.id}: confusion boundary is too short`)
  require(term.lessonIds?.length > 0, `${term.id}: term is unused`)
  let appearsInAssignedLesson = false

  for (const lessonId of term.lessonIds ?? []) {
    const lesson = lessonById.get(lessonId)
    require(lesson, `${term.id}: unknown lesson ${lessonId}`)
    if (!lesson) continue
    require(lesson.subjectId === term.subjectId, `${term.id}: crosses into ${lesson.subjectId}`)
    const searchableLabels = [term.label, ...term.aliases]
      .map((label) => label.trim().toLowerCase())
      .filter((label) => label.length >= 2)
    const appearsInLesson = searchableLabels.some((label) => lesson.text.includes(label))
    appearsInAssignedLesson ||= appearsInLesson
    coverage.get(lessonId).push({ termId: term.id, appearsInLesson })
  }
  require(term.interfaceTerm === true ||
    appearsInAssignedLesson, `${term.id}: no label or alias appears in any assigned lesson`)
}

for (const [lessonId, termsForLesson] of coverage) {
  require(termsForLesson.length >= 3, `${lessonId}: only ${termsForLesson.length} beginner terms`)
  require(termsForLesson.length <=
    6, `${lessonId}: ${termsForLesson.length} terms would form a jargon wall`)
  require(new Set(termsForLesson.map((term) => term.termId)).size ===
    termsForLesson.length, `${lessonId}: duplicate glossary references`)
  require(termsForLesson.some(
    (term) => term.appearsInLesson
  ), `${lessonId}: none of its selected terms appears in the lesson text`)
}

if (errors.length > 0) {
  for (const error of errors) process.stderr.write(`- ${error}\n`)
  process.exit(1)
}

process.stdout.write(
  `Validated ${glossary.terms.length} beginner terms across ${coverage.size} lessons.\n`
)
