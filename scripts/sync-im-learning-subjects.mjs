import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'public', 'data')

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))
}

function importance(topicId) {
  const highPriority = new Set([
    'im-mis-strategy',
    'im-mis-data-ai',
    'im-mis-governance',
    'im-stat-regression',
  ])
  return highPriority.has(topicId) ? 5 : 4
}

const subjects = read('subjects-im.json')
const masters = new Map([
  ['im-mis', read('im-mis-concept-master.json')],
  ['im-stat', read('im-stat-concept-master.json')],
])

for (const subject of subjects) {
  const master = masters.get(subject.id)
  if (!master) continue

  subject.topics = master.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    importance: importance(topic.id),
    subtopics: topic.subtopics.map((subtopic) => subtopic.title),
  }))
}

const outputPath = path.join(dataDir, 'subjects-im.json')
const rendered = `${JSON.stringify(subjects, null, 2)}\n`
if (process.argv.includes('--check')) {
  if (fs.readFileSync(outputPath, 'utf8') !== rendered) {
    throw new Error('IM subject topics drifted from their canonical concept masters')
  }
  process.stdout.write('Verified canonical IM-MIS and IM-STAT subject topics.\n')
  process.exit(0)
}

fs.writeFileSync(outputPath, rendered)

console.log('Synced IM-MIS and IM-STAT subject topics from their canonical concept masters.')
