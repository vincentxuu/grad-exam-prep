import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fragmentPaths = [
  '.work/im-it-beginner-glossary-fragment.json',
  '.work/im-mis-beginner-glossary-fragment.json',
  '.work/im-stat-beginner-glossary-fragment.json',
]

function read(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

const fragments = fragmentPaths.map(read)
const terms = fragments.flatMap((fragment) =>
  fragment.terms.map((term) => ({ ...term, subjectId: fragment.subjectId }))
)
const output = {
  schemaVersion: 1,
  contentStatus: 'reviewed',
  review: {
    reviewedBy: 'Codex beginner-content audit',
    reviewedAt: '2026-08-16',
    scope: '逐堂挑選第一次閱讀必需的術語；白話定義、生活例子與易混淆邊界均對照原課內容。',
  },
  totalTerms: terms.length,
  terms,
}
const outputPath = path.join(root, 'public/data/im-beginner-glossary.json')
const rendered = `${JSON.stringify(output, null, 2)}\n`

if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== rendered) {
    process.stderr.write('IM beginner glossary artifact drifted from reviewed fragments.\n')
    process.exit(1)
  }
  process.stdout.write(`Verified ${terms.length} beginner glossary terms.\n`)
  process.exit(0)
}

fs.writeFileSync(outputPath, rendered)
process.stdout.write(`Built ${terms.length} beginner glossary terms.\n`)
