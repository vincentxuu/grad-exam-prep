#!/usr/bin/env node
// Fix pp-im-en-106 Q21-50: consolidate fragmented passage text into group headers.
// Cloze passages (Q21-40) have text fragments scattered across questions.
// Reading passages (Q41-50) need full text from PDF — handled separately.

const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, '../public/data/questions.json')
const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))

// Passage groups: [firstQ, lastQ]
const CLOZE_GROUPS = [
  { first: 21, last: 26, label: 'Passage I' },
  { first: 27, last: 32, label: 'Passage II' },
  { first: 33, last: 40, label: 'Passage III' },
]

function getQ(number) {
  return data.questions.find(q => q.paperId === 'pp-im-en-106' && q.number === number)
}

function extractOptions(text) {
  // Extract (A)...(D) options from end of text
  const m = text.match(/\(A\)\s*.+$/s)
  return m ? m[0] : ''
}

function extractPassageText(text) {
  // Remove [Passage X Cloze] markers and trailing options
  let t = text.replace(/\[Passage [IVX]+ Cloze\]/g, '').trim()
  // Remove options
  t = t.replace(/\(A\)\s*.+$/s, '').trim()
  return t
}

// For each cloze group, concatenate all passage fragments into the first question
for (const group of CLOZE_GROUPS) {
  const fragments = []
  for (let n = group.first; n <= group.last; n++) {
    const q = getQ(n)
    if (!q) continue
    fragments.push(extractPassageText(q.text))
  }

  const fullPassage = fragments.join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\.\.\./g, '') // remove leading ellipsis from fragments
    .replace(/\s*,\s*,/g, ',') // clean double commas
    .trim()

  // Update first question: passage header + full passage + its options
  const firstQ = getQ(group.first)
  const options = extractOptions(firstQ.text)
  firstQ.text = `Questions ${group.first}-${group.last} refer to the following passage.\n\n${fullPassage}\n\n${group.first}. ${options}`

  // Update subsequent questions: just their number + options
  for (let n = group.first + 1; n <= group.last; n++) {
    const q = getQ(n)
    if (!q) continue
    const opts = extractOptions(q.text)
    q.text = `${n}. ${opts}`
  }
}

// Reading comprehension groups — strip markers, add "refer to" header
const READING_GROUPS = [
  { first: 41, last: 45, label: 'Passage I' },
  { first: 46, last: 50, label: 'Passage II' },
]

for (const group of READING_GROUPS) {
  // These questions need the full passage text from the PDF.
  // For now, just clean up the markers and add the group header.
  // The passage text will need to be added manually or via PDF extraction.
  for (let n = group.first; n <= group.last; n++) {
    const q = getQ(n)
    if (!q) continue
    q.text = q.text
      .replace(/\[Passage [IVX]+ Reading Comprehension\]\s*/g, '')
      .trim()
  }
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(data, null, 2) + '\n')
console.log('Done: pp-im-en-106 cloze passages consolidated.')
console.log('Note: Reading comprehension passages (Q41-50) still need full text from PDF.')
