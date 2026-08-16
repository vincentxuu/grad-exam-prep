import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import verificationRaw from '../../public/data/im-it-paper-verification.json'
import questionImagesRaw from '../../public/data/question-images.json'
import questionsRaw from '../../public/data/questions.json'

const questions = questionsRaw.questions.filter((question) => question.subjectId === 'im-it')
const questionImages = questionImagesRaw as Record<string, string[]>
const expectedCountsByYear: Record<number, number> = {
  106: 26,
  107: 26,
  108: 22,
  109: 22,
  110: 29,
  111: 25,
  112: 29,
  113: 25,
  114: 25,
  115: 31,
}

const sha256 = (value: Buffer | string) =>
  crypto.createHash('sha256').update(value).digest('hex')

describe('IM information technology source integrity', () => {
  test('keeps the aggregate question count metadata current', () => {
    expect(questionsRaw.totalQuestions).toBe(questionsRaw.questions.length)
  })

  test('preserves every question number from the ten source papers', () => {
    expect(questions).toHaveLength(260)

    for (const [yearText, expectedCount] of Object.entries(expectedCountsByYear)) {
      const year = Number(yearText)
      const paper = questions
        .filter((question) => question.year === year)
        .sort((a, b) => a.number - b.number)

      expect(paper).toHaveLength(expectedCount)
      expect(paper.map((question) => question.number)).toEqual(
        Array.from({ length: expectedCount }, (_, index) => index + 1),
      )
    }
  })

  test('keeps multiple-choice labels complete and ordered', () => {
    const malformed = questions
      .map((question) => ({
        id: question.id,
        labels: [...question.text.matchAll(/\(([A-E])\)/g)].map((match) => match[1]),
      }))
      .filter(({ labels }) => labels.length > 0 && labels.join('') !== 'ABCDE')

    expect(malformed).toEqual([])
  })

  test('keeps declared image dependencies backed by real files', () => {
    const broken = questions
      .filter((question) => question.hasImage)
      .flatMap((question) => {
        const images = questionImages[question.id] ?? []
        if (images.length === 0) return [`${question.id}: missing image mapping`]
        return images
          .filter((image) => !fs.existsSync(path.join(process.cwd(), 'public', image)))
          .map((image) => `${question.id}: missing ${image}`)
      })

    expect(broken).toEqual([])
  })

  test('matches the visually audited PDF and question snapshots', () => {
    for (const [yearText, verification] of Object.entries(verificationRaw.papers)) {
      const year = Number(yearText)
      const paperQuestions = questions
        .filter((question) => question.year === year)
        .sort((a, b) => a.number - b.number)
        .map(({ id, number, text, points, hasImage, subQuestions }) => ({
          id,
          number,
          text,
          points,
          hasImage,
          subQuestions,
        }))
      const pdfPath = path.join(process.cwd(), `public/papers/pp-im-it-${year}.pdf`)

      expect(paperQuestions).toHaveLength(verification.questionCount)
      expect(sha256(fs.readFileSync(pdfPath))).toBe(verification.pdfSha256)
      expect(sha256(JSON.stringify(paperQuestions))).toBe(verification.questionsSha256)
    }
  })
})
