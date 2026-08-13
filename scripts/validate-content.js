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
const questions = loadJson('questions.json').questions

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
const planIds = new Set()
const planTaskIds = new Set()
const planPhaseIds = new Set()
const defaultPlanByExam = {}

studyPlans.forEach((plan) => {
  if (!examIds.has(plan.examId)) err(`StudyPlan has invalid examId: ${plan.examId}`)
  if (!plan.id) err(`StudyPlan for ${plan.examId} is missing an id`)
  if (!plan.name) err(`StudyPlan ${plan.id} is missing a name`)
  if (planIds.has(plan.id)) err(`Duplicate study plan id: ${plan.id}`)
  planIds.add(plan.id)

  if (plan.isDefault) {
    if (defaultPlanByExam[plan.examId]) {
      err(
        `Exam ${plan.examId} has more than one default plan: ${defaultPlanByExam[plan.examId]}, ${plan.id}`
      )
    }
    defaultPlanByExam[plan.examId] = plan.id
  }

  plan.phases.forEach((phase) => {
    // Custom tasks are stored against a phase id, so phase ids must not collide
    // across plans either.
    if (planPhaseIds.has(phase.id)) err(`Duplicate study phase id: ${phase.id}`)
    planPhaseIds.add(phase.id)

    phase.tasks.forEach((task) => {
      // Completed tasks live in localStorage keyed by task id alone — a
      // collision across plans would silently share progress between them.
      if (planTaskIds.has(task.id)) err(`Duplicate study task id: ${task.id}`)
      planTaskIds.add(task.id)

      if (task.subjectTag && !subjectIds.has(task.subjectTag)) {
        warn(`Task ${task.id} references unknown subject: ${task.subjectTag}`)
      }
    })
  })
})

examIds.forEach((examId) => {
  const plansForExam = studyPlans.filter((p) => p.examId === examId)
  if (plansForExam.length && !defaultPlanByExam[examId]) {
    warn(`Exam ${examId} has no plan marked isDefault; the first one will be used`)
  }
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

// Validate questions.
// 資管所的資訊管理導論與統計學共用同一份 PDF，抽題時整份卷子曾被同時寫進兩個科目，
// 讓每個科目的分頁都混進另一科的題目。同一段題目文字只能屬於一個科目。
const questionIds = new Set()
const questionsByText = new Map()

questions.forEach((q) => {
  if (questionIds.has(q.id)) err(`Duplicate question id: ${q.id}`)
  questionIds.add(q.id)
  if (!examIds.has(q.examId)) err(`Question ${q.id} has invalid examId: ${q.examId}`)
  if (!subjectIds.has(q.subjectId)) err(`Question ${q.id} has invalid subjectId: ${q.subjectId}`)
  if (!pastPapers.find((pp) => pp.id === q.paperId))
    err(`Question ${q.id} references unknown paperId: ${q.paperId}`)

  const textKey = q.text.trim()
  const seen = questionsByText.get(textKey)
  if (seen && seen.subjectId !== q.subjectId) {
    err(`Question ${q.id} (${q.subjectId}) duplicates ${seen.id} (${seen.subjectId})`)
  } else if (seen) {
    warn(`Question ${q.id} has the same text as ${seen.id}`)
  } else {
    questionsByText.set(textKey, q)
  }
})

console.log('\n📝 Question Coverage:')
subjects.forEach((subj) => {
  const count = questions.filter((q) => q.subjectId === subj.id).length
  const status = count > 0 ? '✅' : '❌'
  console.log(`  ${status} ${subj.name}: ${count} questions`)
})

// Validate resources
resources.forEach((res) => {
  res.examRelevance.forEach((eid) => {
    if (!examIds.has(eid)) err(`Resource ${res.id} has invalid examRelevance: ${eid}`)
  })
})

// Validate guides.
// Guides are pointers to other people's articles, never copies of them: each one
// must carry a working source URL, and `topics` must stay a list of short subject
// labels rather than a retelling of the article.
const TOPIC_MAX_LENGTH = 40
const guideIds = new Set()

guides.forEach((guide) => {
  if (guideIds.has(guide.id)) err(`Duplicate guide id: ${guide.id}`)
  guideIds.add(guide.id)
  if (!guide.source?.url?.startsWith('http')) err(`Guide ${guide.id} missing a valid source url`)
  if (!guide.source?.platform) err(`Guide ${guide.id} missing source platform`)
  if (!guide.topics?.length) err(`Guide ${guide.id} has no topics`)
  guide.examRelevance.forEach((eid) => {
    if (!examIds.has(eid)) err(`Guide ${guide.id} has invalid examRelevance: ${eid}`)
  })
  guide.topics?.forEach((topic) => {
    if (topic.length > TOPIC_MAX_LENGTH) {
      err(
        `Guide ${guide.id} topic is ${topic.length} chars (max ${TOPIC_MAX_LENGTH}) — topics label what the original covers, they do not restate it: "${topic}"`
      )
    }
  })
})

console.log('\n📖 Guides (導讀，非轉載):')
guides.forEach((guide) => {
  console.log(
    `  ✅ ${guide.title} (${guide.examRelevance.join('/')}): ${guide.topics.length} topics → ${guide.source.url}`
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
