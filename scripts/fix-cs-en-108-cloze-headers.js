#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, '../public/data/questions.json')
const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))

function getQ(number) {
  return data.questions.find(q => q.paperId === 'pp-cs-en-108' && q.number === number)
}

const groups = [
  { first: 21, last: 25, label: 'I' },
  { first: 26, last: 30, label: 'II' },
  { first: 31, last: 35, label: 'III' },
  { first: 36, last: 40, label: 'IV' },
]

for (const g of groups) {
  const q = getQ(g.first)
  if (!q) continue
  // Replace "Passage X (Cloze Test): " with proper header
  const cleaned = q.text.replace(/^Passage\s+[IVX]+\s*\(Cloze Test\):\s*/, '')
  q.text = `Questions ${g.first}-${g.last} refer to the following passage.\n\n${cleaned}`
  console.log(`Fixed Q${g.first} header`)
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(data, null, 2) + '\n')
console.log('Saved')
