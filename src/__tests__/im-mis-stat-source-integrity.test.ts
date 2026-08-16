import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import answersRaw from '../../public/data/answers.json'
import paperImagesRaw from '../../public/data/paper-images.json'
import pastPapersRaw from '../../public/data/past-papers.json'
import questionImagesRaw from '../../public/data/question-images.json'
import questionsRaw from '../../public/data/questions.json'
import verificationRaw from '../../public/data/im-mis-stat-paper-verification.json'

const subjects = ['im-mis', 'im-stat'] as const
const questions = questionsRaw.questions.filter((question) =>
  subjects.includes(question.subjectId as (typeof subjects)[number]),
)
const answers = answersRaw.answers as Record<
  string,
  { questionId: string; answer: string; explanation: string }
>
const questionImages = questionImagesRaw as Record<string, string[]>
const paperImages = paperImagesRaw as Record<string, string[]>
const sha256 = (value: Buffer | string) =>
  crypto.createHash('sha256').update(value).digest('hex')

describe('IM MIS and statistics source integrity', () => {
  test('preserves the audited question counts, numbering, and points', () => {
    expect(questions.filter((question) => question.subjectId === 'im-mis')).toHaveLength(37)
    expect(questions.filter((question) => question.subjectId === 'im-stat')).toHaveLength(5)

    for (const [subjectId, papers] of Object.entries(verificationRaw.papers)) {
      for (const [yearText, expected] of Object.entries(papers)) {
        const rows = questions
          .filter(
            (question) =>
              question.subjectId === subjectId && question.year === Number(yearText),
          )
          .sort((a, b) => a.number - b.number)
        expect(rows).toHaveLength(expected.questionCount)
        expect(rows.reduce((sum, question) => sum + (question.points ?? 0), 0)).toBe(
          expected.points,
        )
      }
    }
  })

  test('does not invent statistics papers before the subject was introduced', () => {
    for (const year of verificationRaw.notApplicableStatisticsYears) {
      expect(
        questions.filter(
          (question) => question.subjectId === 'im-stat' && question.year === year,
        ),
      ).toEqual([])
      const paper = pastPapersRaw.papers.find(
        (candidate) => candidate.id === `pp-im-stat-${year}`,
      )
      expect(paper?.url).toBeNull()
      expect(paper?.verified).toBe(false)
      expect(paper?.note).toContain('尚未設統計考科')
    }
  })

  test('uses N/A instead of fake option letters for every essay answer', () => {
    const invalid = questions.filter((question) => {
      const answer = answers[question.id]
      return (
        !answer ||
        answer.questionId !== question.id ||
        answer.answer !== 'N/A' ||
        answer.explanation.trim().length < 80
      )
    })
    expect(invalid).toEqual([])
  })

  test('preserves all explicitly labeled subquestion metadata', () => {
    expect(
      questions.filter(
        (question) => question.subjectId === 'im-mis' && question.subQuestions.length > 0,
      ),
    ).toHaveLength(28)
    expect(
      questions.filter(
        (question) => question.subjectId === 'im-stat' && question.subQuestions.length > 0,
      ),
    ).toHaveLength(4)
  })

  test('matches the visually audited PDF and ordered-question snapshots', () => {
    for (const [subjectId, papers] of Object.entries(verificationRaw.papers)) {
      for (const [yearText, expected] of Object.entries(papers)) {
        const year = Number(yearText)
        const rows = questions
          .filter((question) => question.subjectId === subjectId && question.year === year)
          .sort((a, b) => a.number - b.number)
          .map(({ id, number, text, points, hasImage, subQuestions }) => ({
            id,
            number,
            text,
            points,
            hasImage,
            subQuestions,
          }))
        const pdf = fs.readFileSync(
          path.join(process.cwd(), `public/papers/pp-${subjectId}-${year}.pdf`),
        )
        expect(sha256(pdf)).toBe(expected.pdfSha256)
        expect(sha256(JSON.stringify(rows))).toBe(expected.questionsSha256)
      }
    }
  })

  test('keeps declared question and paper images backed by real files', () => {
    const ids = ['pp-im-stat-114', 'pp-im-stat-115']
    const paths = [
      ...ids.flatMap((id) => paperImages[id] ?? []),
      ...questions.flatMap((question) => questionImages[question.id] ?? []),
    ]
    expect(paths).not.toHaveLength(0)
    expect(paths.filter((image) => !fs.existsSync(path.join(process.cwd(), 'public', image)))).toEqual(
      [],
    )
    expect(questionImages['q-pp-im-stat-114-4']).toEqual([
      '/images/papers/pp-im-stat-114/page-2.jpg',
    ])
  })
})
