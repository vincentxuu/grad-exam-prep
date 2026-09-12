import fs from 'node:fs'

const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions.filter(
  (question) => question.subjectId === 'im-it',
)

function tokens(value) {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .match(/[a-z][a-z0-9_]{2,}|\d+(?:\.\d+)?|[\p{Script=Han}]{2,}/gu) ?? []
}

const stop = new Set([
  'the', 'and', 'that', 'this', 'with', 'which', 'following', 'above', 'below', 'none', 'about',
  'from', 'into', 'each', 'only', 'will', 'what', 'when', 'where', 'have', 'has', 'are', 'is',
])

const rows = []
for (let year = 106; year <= 115; year += 1) {
  const dir = `tmp/pdfs/im-it-audit/${year}`
  const ocr = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.txt'))
    .sort()
    .map((name) => fs.readFileSync(`${dir}/${name}`, 'utf8'))
    .join('\n')
  const ocrTokens = new Set(tokens(ocr))

  for (const question of questions.filter((item) => item.year === year)) {
    const significant = [...new Set(tokens(question.text).filter((token) => !stop.has(token)))]
    const matched = significant.filter((token) => ocrTokens.has(token))
    rows.push({
      id: question.id,
      year,
      number: question.number,
      tokenCount: significant.length,
      matched: matched.length,
      recall: significant.length ? Number((matched.length / significant.length).toFixed(3)) : 1,
      missingTokens: significant.filter((token) => !ocrTokens.has(token)).slice(0, 20),
    })
  }
}

const summary = {
  total: rows.length,
  below50: rows.filter((row) => row.recall < 0.5).length,
  below70: rows.filter((row) => row.recall < 0.7).length,
  lowest: [...rows].sort((a, b) => a.recall - b.recall).slice(0, 50),
  byYear: Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => index + 106).map((year) => {
      const yearRows = rows.filter((row) => row.year === year)
      return [
        year,
        {
          questions: yearRows.length,
          averageRecall: Number(
            (yearRows.reduce((sum, row) => sum + row.recall, 0) / yearRows.length).toFixed(3),
          ),
          below50: yearRows.filter((row) => row.recall < 0.5).map((row) => row.number),
        },
      ]
    }),
  ),
}

fs.writeFileSync('.work/im-it-ocr-comparison.json', `${JSON.stringify({ summary, rows }, null, 2)}\n`)
console.log(JSON.stringify(summary, null, 2))
