#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, '../public/data/questions.json')
const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))

const ocr = fs.readFileSync('/tmp/pp-cs-en-108-ocr.txt', 'utf8')
const lines = ocr.split('\n')

function getQ(number) {
  return data.questions.find(q => q.paperId === 'pp-cs-en-108' && q.number === number)
}

// Find reading passage sections in OCR text
// The OCR has: "Passage I" (around line 291) then passage text, then "41." for questions
// And "Passage II" (around line 406) then passage text, then "46." for questions

// Find the SECOND occurrence of "Passage I" (first is cloze, second is reading)
let passageICount = 0
let readingPassage1Start = -1
let readingPassage1End = -1
let readingPassage2Start = -1
let readingPassage2End = -1

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()
  if (/^Passage\s+I$/i.test(line)) {
    passageICount++
    if (passageICount === 2) {
      // This is reading Passage I - text starts after this line
      readingPassage1Start = i + 1
    }
  }
  if (readingPassage1Start > 0 && readingPassage1End < 0 && /^41[\.\s]/.test(line)) {
    readingPassage1End = i
  }
  if (/^Passage\s+II$/i.test(line) && readingPassage1Start > 0) {
    // This is reading Passage II
    readingPassage2Start = i + 1
  }
  if (readingPassage2Start > 0 && readingPassage2End < 0 && /^46[\.\s]/.test(line)) {
    readingPassage2End = i
  }
}

console.log('Reading Passage I: lines', readingPassage1Start, '-', readingPassage1End)
console.log('Reading Passage II: lines', readingPassage2Start, '-', readingPassage2End)

if (readingPassage1Start > 0 && readingPassage1End > readingPassage1Start) {
  const passage1 = lines.slice(readingPassage1Start, readingPassage1End)
    .map(l => l.trim())
    .filter(l => l && !/^=== PAGE/.test(l) && !/^见背面|接次页|接次頁|試題隨卷繳回/.test(l))
    .join('\n')
    .trim()

  console.log('Passage I length:', passage1.length, 'chars')

  if (passage1.length > 100) {
    const q41 = getQ(41)
    if (q41) {
      // Remove the "Reading Comprehension Passage I: " prefix and add proper passage
      const questionText = q41.text.replace(/^Reading Comprehension Passage I:\s*/, '')
      q41.text = `Questions 41-45 refer to the following passage.\n\n${passage1}\n\n41. ${questionText}`
      console.log('Updated Q41')
    }
  }
}

if (readingPassage2Start > 0 && readingPassage2End > readingPassage2Start) {
  const passage2 = lines.slice(readingPassage2Start, readingPassage2End)
    .map(l => l.trim())
    .filter(l => l && !/^=== PAGE/.test(l) && !/^见背面|接次页|接次頁|試題隨卷繳回/.test(l))
    .join('\n')
    .trim()

  console.log('Passage II length:', passage2.length, 'chars')

  if (passage2.length > 100) {
    const q46 = getQ(46)
    if (q46) {
      const questionText = q46.text.replace(/^Reading Comprehension Passage II:\s*/, '')
      q46.text = `Questions 46-50 refer to the following passage.\n\n${passage2}\n\n46. ${questionText}`
      console.log('Updated Q46')
    }
  }
}

// Also fix Q42-45 and Q47-50: remove "Reading Comprehension Passage X: " prefixes
for (let n = 42; n <= 45; n++) {
  const q = getQ(n)
  if (q) q.text = q.text.replace(/^Reading Comprehension Passage I:\s*/, '')
}
for (let n = 47; n <= 50; n++) {
  const q = getQ(n)
  if (q) q.text = q.text.replace(/^Reading Comprehension Passage II:\s*/, '')
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(data, null, 2) + '\n')
console.log('Saved questions.json')
