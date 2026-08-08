#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '../public/data')

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}

const exams = loadJson('exams.json')
const subjectsIm = loadJson('subjects-im.json')
const subjectsCs = loadJson('subjects-cs.json')
const subjects = [...subjectsIm, ...subjectsCs]
const studyPlans = loadJson('study-plans.json')
const flashcards = loadJson('flashcards.json')
const resources = loadJson('resources.json')
const pastPapersData = loadJson('past-papers.json')
const pastPapers = pastPapersData.papers
const guides = loadJson('guides.json')

const errors = []
const warnings = []

function err(msg) {
  errors.push(msg)
}
function warn(msg) {
  warnings.push(msg)
}

// Validate exams
const examIds = new Set(exams.map((e) => e.id))
if (!examIds.has('im')) err('Missing exam: im')
if (!examIds.has('cs')) err('Missing exam: cs')

exams.forEach((exam) => {
  if (!exam.code) err(`Exam ${exam.id} missing code`)
  if (!exam.admissions?.length) err(`Exam ${exam.id} missing admissions data`)
  exam.subjects.forEach((sid) => {
    if (!subjects.find((s) => s.id === sid))
      err(`Exam ${exam.id} references unknown subject: ${sid}`)
  })
})

// Validate subjects
const subjectIds = new Set(subjects.map((s) => s.id))

subjects.forEach((subj) => {
  if (!examIds.has(subj.examId)) err(`Subject ${subj.id} has invalid examId: ${subj.examId}`)
  if (!subj.topics?.length) warn(`Subject ${subj.id} has no topics`)
  if (!subj.materials?.length) warn(`Subject ${subj.id} has no materials`)
  subj.topics.forEach((topic) => {
    if (topic.importance < 1 || topic.importance > 5)
      err(`Topic ${topic.id} has invalid importance: ${topic.importance}`)
  })
})

// Coverage report: topics per subject
console.log('\n📊 Subject Coverage:')
subjects.forEach((subj) => {
  const topicCount = subj.topics?.length ?? 0
  const matCount = subj.materials?.length ?? 0
  const fcCount = flashcards.filter((fc) => fc.subjectId === subj.id).length
  const ppCount = pastPapers.filter((pp) => pp.subjectId === subj.id).length
  const status = topicCount > 0 ? '✅' : '❌'
  console.log(
    `  ${status} ${subj.name} (${subj.examId}): ${topicCount} topics, ${matCount} materials, ${fcCount} flashcards, ${ppCount} past papers`
  )
})

// Validate study plans
studyPlans.forEach((plan) => {
  if (!examIds.has(plan.examId)) err(`StudyPlan has invalid examId: ${plan.examId}`)
  plan.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      if (task.subjectTag && !subjectIds.has(task.subjectTag)) {
        warn(`Task ${task.id} references unknown subject: ${task.subjectTag}`)
      }
    })
  })
})

// Validate flashcards
const fcIds = new Set()
flashcards.forEach((fc) => {
  if (fcIds.has(fc.id)) err(`Duplicate flashcard id: ${fc.id}`)
  fcIds.add(fc.id)
  if (!examIds.has(fc.examId)) err(`Flashcard ${fc.id} has invalid examId`)
  if (!subjectIds.has(fc.subjectId))
    err(`Flashcard ${fc.id} has invalid subjectId: ${fc.subjectId}`)
  const subj = subjects.find((s) => s.id === fc.subjectId)
  if (subj && !subj.topics.find((t) => t.id === fc.topicId)) {
    warn(`Flashcard ${fc.id} references unknown topicId: ${fc.topicId}`)
  }
})

// Flashcard coverage gaps
console.log('\n📇 Flashcard Coverage:')
subjects.forEach((subj) => {
  const count = flashcards.filter((fc) => fc.subjectId === subj.id).length
  const status = count >= 3 ? '✅' : count > 0 ? '⚠️ ' : '❌'
  console.log(`  ${status} ${subj.name}: ${count} cards ${count < 3 ? '(target: 3+)' : ''}`)
})

// Validate resources
resources.forEach((res) => {
  res.examRelevance.forEach((eid) => {
    if (!examIds.has(eid)) err(`Resource ${res.id} has invalid examRelevance: ${eid}`)
  })
})

// Validate guides
const GUIDE_BLOCK_TYPES = new Set([
  'prose',
  'list',
  'callout',
  'compare',
  'table',
  'prompt',
  'quote',
  'subject',
  'links',
])
const guideIds = new Set()

guides.forEach((guide) => {
  if (guideIds.has(guide.id)) err(`Duplicate guide id: ${guide.id}`)
  guideIds.add(guide.id)
  if (!guide.source?.url) err(`Guide ${guide.id} missing source url`)
  if (!guide.summary) err(`Guide ${guide.id} missing summary`)
  if (!guide.takeaways?.length) warn(`Guide ${guide.id} has no takeaways`)
  guide.examRelevance.forEach((eid) => {
    if (!examIds.has(eid)) err(`Guide ${guide.id} has invalid examRelevance: ${eid}`)
  })

  const pctSum = (guide.timeAllocation?.items ?? []).reduce((sum, item) => sum + item.pct, 0)
  if (guide.timeAllocation && pctSum !== 100) {
    err(`Guide ${guide.id} timeAllocation percentages sum to ${pctSum}, expected 100`)
  }

  const sectionIds = new Set()
  guide.sections.forEach((section) => {
    if (sectionIds.has(section.id)) err(`Guide ${guide.id} has duplicate section id: ${section.id}`)
    sectionIds.add(section.id)
    if (!section.blocks?.length) warn(`Guide ${guide.id} section ${section.id} has no blocks`)
    section.blocks.forEach((block, i) => {
      const where = `Guide ${guide.id} section ${section.id} block ${i}`
      if (!GUIDE_BLOCK_TYPES.has(block.type)) err(`${where} has unknown type: ${block.type}`)
      if (block.type === 'subject' && block.subjectId && !subjectIds.has(block.subjectId)) {
        err(`${where} references unknown subjectId: ${block.subjectId}`)
      }
      if (block.type === 'prompt' && !block.prompt) err(`${where} is a prompt block with no prompt`)
      if (block.type === 'table') {
        const cols = block.headers?.length ?? 0
        block.rows?.forEach((row, r) => {
          if (row.length !== cols) err(`${where} row ${r} has ${row.length} cells, expected ${cols}`)
        })
      }
    })
  })
})

console.log('\n📖 Guides:')
guides.forEach((guide) => {
  const blockCount = guide.sections.reduce((sum, s) => sum + (s.blocks?.length ?? 0), 0)
  console.log(
    `  ✅ ${guide.title} (${guide.examRelevance.join('/')}): ${guide.sections.length} sections, ${blockCount} blocks`
  )
})

// Past papers coverage
console.log('\n📄 Past Paper Coverage:')
const imSubjects = subjects.filter((s) => s.examId === 'im')
const csSubjects = subjects.filter((s) => s.examId === 'cs')

;[...imSubjects, ...csSubjects].forEach((subj) => {
  const papers = pastPapers.filter((pp) => pp.subjectId === subj.id)
  const years = papers.map((pp) => pp.year).sort((a, b) => b - a)
  const status = papers.length >= 8 ? '✅' : papers.length > 0 ? '⚠️ ' : '❌'
  console.log(
    `  ${status} ${subj.name}: ${papers.length} papers (years: ${years.join(', ') || 'none'})`
  )
})

// Summary
console.log('\n📋 Summary:')
console.log(`  Exams: ${exams.length}`)
console.log(`  Subjects: ${subjects.length} (IM: ${subjectsIm.length}, CS: ${subjectsCs.length})`)
console.log(`  Study plans: ${studyPlans.length}`)
console.log(`  Flashcards: ${flashcards.length}`)
console.log(`  Resources: ${resources.length}`)
console.log(`  Past papers: ${pastPapers.length}`)
console.log(`  Guides: ${guides.length}`)

if (warnings.length) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`)
  warnings.forEach((w) => console.log(`  - ${w}`))
}

if (errors.length) {
  console.log(`\n❌ Errors (${errors.length}):`)
  errors.forEach((e) => console.log(`  - ${e}`))
  process.exit(1)
} else {
  console.log('\n✅ Content validation passed')
}
