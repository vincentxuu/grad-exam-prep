#!/usr/bin/env node
/**
 * Fix reading comprehension passages for pp-im-en-106 and pp-cs-en-108.
 * Reads OCR text files, extracts passage content, and merges into questions.json.
 *
 * The OCR text is imperfect but good enough for reading comprehension context.
 * Run after ocr-pdf-to-text.py has generated the .txt files.
 */

const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, '../public/data/questions.json')
const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))

function getQ(paperId, number) {
  return data.questions.find(q => q.paperId === paperId && q.number === number)
}

// ─── pp-im-en-106: Reading Comprehension Passages ──────────────

const ocr106 = fs.readFileSync('/tmp/pp-im-en-106-ocr.txt', 'utf8')

// Extract passages by finding text between markers
function extractBetween(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker)
  if (startIdx === -1) return null
  const afterStart = startIdx + startMarker.length
  const endIdx = endMarker ? text.indexOf(endMarker, afterStart) : text.length
  return text.slice(afterStart, endIdx === -1 ? text.length : endIdx).trim()
}

// Reading Passage I (Q41-45): "Every morning, when I wake again..."
// Find text between "Passage I" (in Reading Comprehension section) and "41."
const pages106 = ocr106.split(/=== PAGE \d+ ===/).filter(Boolean)

// Page 3-4 has the reading passages
let readingSection106 = ''
for (let i = 2; i < pages106.length; i++) {
  readingSection106 += pages106[i] + '\n'
}

// Extract Passage I: between "Reading Comprehension" header and Q41
let passage1Start = readingSection106.search(/Every morning|Every moming/)
let passage1End = readingSection106.search(/\n41[\.\s]/)
let passage1 = ''
if (passage1Start >= 0 && passage1End > passage1Start) {
  passage1 = readingSection106.slice(passage1Start, passage1End).trim()
    .replace(/\n+/g, '\n')
    .replace(/见背面|接次页|接次頁|試題隨卷繳回/g, '')
    .trim()
}

// Extract Passage II: between "Passage II" and Q46
let passage2Start = readingSection106.search(/When I first encountered|When Ifirst encountered/)
let passage2End = readingSection106.search(/\n46[\.\s]/)
let passage2 = ''
if (passage2Start >= 0 && passage2End > passage2Start) {
  passage2 = readingSection106.slice(passage2Start, passage2End).trim()
    .replace(/\n+/g, '\n')
    .replace(/见背面|接次页|接次頁|試題隨卷繳回/g, '')
    .trim()
}

console.log('EN-106 Passage I length:', passage1.length, 'chars')
console.log('EN-106 Passage II length:', passage2.length, 'chars')

// Update Q41 with Passage I
if (passage1.length > 100) {
  const q41 = getQ('pp-im-en-106', 41)
  if (q41) {
    q41.text = `Questions 41-45 refer to the following passage.\n\n${passage1}\n\n${q41.text}`
    console.log('Updated Q41 with Passage I')
  }
}

// Update Q46 with Passage II
if (passage2.length > 100) {
  const q46 = getQ('pp-im-en-106', 46)
  if (q46) {
    q46.text = `Questions 46-50 refer to the following passage.\n\n${passage2}\n\n${q46.text}`
    console.log('Updated Q46 with Passage II')
  }
}

// ─── pp-cs-en-108: Reading Comprehension Passages ──────────────

const ocr108 = fs.readFileSync('/tmp/pp-cs-en-108-ocr.txt', 'utf8')
const pages108 = ocr108.split(/=== PAGE \d+ ===/).filter(Boolean)

// This paper has cloze and reading sections
// We need to find the passage groups and attach them to the right questions
// Check current state of the questions first
const cs108Qs = data.questions.filter(q => q.paperId === 'pp-cs-en-108')
console.log('\nCS-EN-108: total questions:', cs108Qs.length)

// Find questions that reference passages but don't have passage text
const passageQs = cs108Qs.filter(q => q.number >= 21 && q.number <= 46)
console.log('CS-EN-108 Q21-46 count:', passageQs.length)

// For cs-en-108, let's find and extract the cloze/reading passages from OCR text
let fullText108 = pages108.join('\n')

// Find passage sections by looking for "Passage" or "Questions X-Y"
const passageGroups108 = []

// Try to find passage markers and question ranges
const passageMarkers = [...fullText108.matchAll(/(Passage\s+[IVX]+|Questions?\s+\d+[-–]\d+)/gi)]
console.log('CS-EN-108 passage markers found:', passageMarkers.length)
passageMarkers.forEach(m => console.log('  -', m[0], 'at index', m.index))

// For each question group in cs-en-108, find the passage text
// The structure varies per paper, so let's check what Q21 currently looks like
const q21_108 = getQ('pp-cs-en-108', 21)
if (q21_108) {
  console.log('CS-EN-108 Q21 current:', q21_108.text.slice(0, 150))
}

// Save the updated questions.json
fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(data, null, 2) + '\n')
console.log('\nSaved questions.json')
