import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1]
}

const sourceRoot = process.cwd()
const targetRoot = path.resolve(valueAfter('--target-root', sourceRoot))
const reviewRoot = path.resolve(valueAfter('--review-root', path.join(sourceRoot, '.work')))
const writeAnswers = args.includes('--write-answers')
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const primaryFiles = [
  'im-it-answer-review-106-109.json',
  'im-it-answer-review-110-112.json',
  'im-it-answer-review-113-115.json',
]
const crossFiles = [
  'im-it-answer-cross-review-106-109.json',
  'im-it-answer-cross-review-110-112.json',
  'im-it-answer-cross-review-113-115.json',
]

const primary = primaryFiles.flatMap((file) => readJson(path.join(reviewRoot, file)))
const cross = crossFiles.flatMap((file) => readJson(path.join(reviewRoot, file)))
const third = readJson(path.join(reviewRoot, 'im-it-answer-third-review.json'))
const metadataPath = path.join(targetRoot, 'public/data/im-it-question-metadata.json')
const answersPath = path.join(targetRoot, 'public/data/answers.json')
const existingReviewPath = path.join(targetRoot, 'public/data/im-it-answer-review.json')
const metadataDocument = readJson(metadataPath)
const answersDocument = readJson(answersPath)
const existingReviewById = fs.existsSync(existingReviewPath)
  ? new Map(readJson(existingReviewPath).questions.map((review) => [review.questionId, review]))
  : new Map()

const choiceMetadata = metadataDocument.questions.filter(
  (question) => question.questionType === 'single_choice',
)
const expectedIds = new Set(choiceMetadata.map((question) => question.questionId))
const assertExactIds = (label, rows, expected) => {
  const ids = rows.map((row) => row.questionId)
  const unique = new Set(ids)
  const missing = [...expected].filter((id) => !unique.has(id))
  const extra = [...unique].filter((id) => !expected.has(id))
  if (unique.size !== ids.length || missing.length || extra.length) {
    throw new Error(`${label} ID mismatch: duplicate=${ids.length - unique.size}, missing=${missing}, extra=${extra}`)
  }
}

assertExactIds('primary review', primary, expectedIds)
const flagged = primary.filter((review) => review.verdict !== 'confirmed')
assertExactIds('cross review', cross, new Set(flagged.map((review) => review.questionId)))
assertExactIds(
  'third review',
  third,
  new Set(['q-pp-im-it-106-5', 'q-pp-im-it-106-8', 'q-pp-im-it-107-11']),
)

const crossById = new Map(cross.map((review) => [review.questionId, review]))
const thirdById = new Map(third.map((review) => [review.questionId, review]))

const reviews = primary.map((first) => {
  const answerEntry = answersDocument.answers[first.questionId]
  if (!answerEntry || !/^[A-E]$/.test(answerEntry.answer)) {
    throw new Error(`${first.questionId} has no published A-E answer: ${answerEntry?.answer}`)
  }
  const publishedAnswer = existingReviewById.get(first.questionId)?.previousAnswer ?? answerEntry.answer

  if (first.verdict === 'confirmed') {
    const reviewedAnswer = first.currentAnswer
    return {
      questionId: first.questionId,
      status: publishedAnswer === reviewedAnswer ? 'confirmed' : 'corrected',
      previousAnswer: publishedAnswer,
      reviewBaselineAnswer: first.currentAnswer,
      reviewedAnswer,
      confidence: 'medium',
      reviewCount: 1,
      official: false,
      reasoning: [first.reasoning],
      sourceBasis: first.sourceBasis,
      practiceEligible: true,
      autoGradeEligible: true,
    }
  }

  const second = crossById.get(first.questionId)
  if (!second) throw new Error(`Missing cross review for ${first.questionId}`)
  const decidingThird = thirdById.get(first.questionId)

  if (decidingThird) {
    if (decidingThird.verdict === 'disputed') {
      return {
        questionId: first.questionId,
        status: 'disputed',
        previousAnswer: publishedAnswer,
        reviewBaselineAnswer: first.currentAnswer,
        reviewedAnswer: null,
        confidence: 'disputed',
        reviewCount: 3,
        official: false,
        reasoning: [first.reasoning, second.reasoning, decidingThird.reasoning],
        sourceBasis: [...new Set([...first.sourceBasis, ...second.sourceBasis, ...decidingThird.sourceBasis])],
        practiceEligible: false,
        autoGradeEligible: false,
      }
    }

    if (decidingThird.verdict === 'corrected') {
      if (
        !decidingThird.reviewedAnswer ||
        decidingThird.reviewedAnswer !== second.secondReviewedAnswer
      ) {
        throw new Error(`Third-review correction conflict for ${first.questionId}`)
      }
      const reviewedAnswer = decidingThird.reviewedAnswer
      return {
        questionId: first.questionId,
        status: publishedAnswer === reviewedAnswer ? 'confirmed' : 'corrected',
        previousAnswer: publishedAnswer,
        reviewBaselineAnswer: first.currentAnswer,
        reviewedAnswer,
        confidence: 'medium',
        reviewCount: 3,
        official: false,
        reasoning: [second.reasoning, decidingThird.reasoning],
        sourceBasis: [...new Set([...second.sourceBasis, ...decidingThird.sourceBasis])],
        practiceEligible: true,
        autoGradeEligible: true,
      }
    }

    throw new Error(`Unsupported third verdict ${decidingThird.verdict} for ${first.questionId}`)
  }

  if (second.secondVerdict === 'agree_corrected') {
    if (!first.reviewedAnswer || first.reviewedAnswer !== second.secondReviewedAnswer) {
      throw new Error(`Correction conflict for ${first.questionId}`)
    }
    const reviewedAnswer = first.reviewedAnswer
    return {
      questionId: first.questionId,
      status: publishedAnswer === reviewedAnswer ? 'confirmed' : 'corrected',
      previousAnswer: publishedAnswer,
      reviewBaselineAnswer: first.currentAnswer,
      reviewedAnswer,
      confidence: 'medium',
      reviewCount: 2,
      official: false,
      reasoning: [first.reasoning, second.reasoning],
      sourceBasis: [...new Set([...first.sourceBasis, ...second.sourceBasis])],
      practiceEligible: true,
      autoGradeEligible: true,
    }
  }

  if (second.secondVerdict === 'agree_disputed') {
    return {
      questionId: first.questionId,
      status: 'disputed',
      previousAnswer: publishedAnswer,
      reviewBaselineAnswer: first.currentAnswer,
      reviewedAnswer: null,
      confidence: 'disputed',
      reviewCount: 2,
      official: false,
      reasoning: [first.reasoning, second.reasoning],
      sourceBasis: [...new Set([...first.sourceBasis, ...second.sourceBasis])],
      practiceEligible: false,
      autoGradeEligible: false,
    }
  }

  throw new Error(`Unresolved cross review ${second.secondVerdict} for ${first.questionId}`)
})

const counts = Object.fromEntries(
  ['confirmed', 'corrected', 'disputed'].map((status) => [
    status,
    reviews.filter((review) => review.status === status).length,
  ]),
)
if (
  reviews.length !== 246 ||
  counts.confirmed + counts.corrected !== 226 ||
  counts.disputed !== 20
) {
  throw new Error(`Unexpected final counts ${JSON.stringify({ total: reviews.length, ...counts })}`)
}

const reviewDocument = {
  schemaVersion: 1,
  subjectId: 'im-it',
  officialAnswerKeyAvailable: false,
  reviewMethod:
    '逐題技術推導；所有初步更正與爭議題均經第二次獨立覆核，未收斂者再進行第三次裁決。',
  confidencePolicy:
    '本資料不是官方答案。單次可重現推導及多次一致推導均暫標 medium；爭議題退出判分。',
  totalQuestions: reviews.length,
  counts,
  reviewDecisions: {
    confirmedAgainstReviewBaseline: primary.filter((review) => review.verdict === 'confirmed').length,
    correctedAgainstReviewBaseline: primary.filter((review) => review.verdict === 'corrected').length + 1,
    disputed: counts.disputed,
  },
  autoGradeEligible: reviews.filter((review) => review.autoGradeEligible).length,
  questions: reviews.sort((a, b) => a.questionId.localeCompare(b.questionId, 'en', { numeric: true })),
}

const reviewById = new Map(reviewDocument.questions.map((review) => [review.questionId, review]))
metadataDocument.answerReview = {
  status: 'model-assisted-technical-review-complete',
  official: false,
  ...counts,
  autoGradeEligible: reviewDocument.autoGradeEligible,
}
metadataDocument.questions = metadataDocument.questions.map((question) => {
  if (question.questionType !== 'single_choice') return question
  const review = reviewById.get(question.questionId)
  if (!review) throw new Error(`Missing final review ${question.questionId}`)
  const eligible = review.autoGradeEligible
  return {
    ...question,
    answerSource: {
      kind: 'model_assisted_technical_derivation',
      official: false,
      reviewCount: review.reviewCount,
      note: '依原卷題面與技術推導覆核，並非官方答案。',
    },
    answerConfidence: {
      level: review.confidence,
      basis: review.reasoning,
      unresolvedIssues: eligible ? [] : ['題目或選項存在多種合理解讀，暫停判分。'],
    },
    publication: {
      browseEligible: true,
      practiceEligible: eligible,
      autoGradeEligible: eligible,
      fullMockEligible: false,
      blockers: eligible ? ['非官方答案，完整模考需更高信心來源'] : ['答案存在爭議'],
    },
  }
})

const practiceStatus = {
  schemaVersion: 1,
  subjectId: 'im-it',
  official: false,
  counts: {
    autoGradeEligible: reviewDocument.autoGradeEligible,
    disputed: counts.disputed,
    selfReviewOnly: metadataDocument.questions.filter(
      (question) => question.questionType !== 'single_choice',
    ).length,
  },
  questions: Object.fromEntries(
    metadataDocument.questions.map((question) => {
      const review = reviewById.get(question.questionId)
      if (!review) {
        return [
          question.questionId,
          {
            status: 'self_review_only',
            autoGradeEligible: false,
            note: '程式或開放題使用自評，不採 A–E 自動判分。',
          },
        ]
      }
      return [
        question.questionId,
        {
          status: review.status,
          autoGradeEligible: review.autoGradeEligible,
          note: review.autoGradeEligible
            ? '答案已完成可重現的技術覆核；非官方答案。'
            : '答案存在爭議，保留瀏覽但不判分。',
        },
      ]
    }),
  ),
}

for (const review of reviewDocument.questions.filter((question) => question.status === 'corrected')) {
  const entry = answersDocument.answers[review.questionId]
  entry.answer = review.reviewedAnswer
  entry.explanation = `答案經技術覆核後修正為 ${review.reviewedAnswer}（非官方答案）。${review.reasoning.join(' 二次覆核：')} 此結論依原始試卷題面、選項逐項排除與技術定義推導；目前未取得官方答案，因此以技術覆核結果呈現。`
}

writeJson(path.join(targetRoot, 'public/data/im-it-answer-review.json'), reviewDocument)
writeJson(metadataPath, metadataDocument)
writeJson(path.join(targetRoot, 'public/data/im-it-practice-status.json'), practiceStatus)
writeJson(path.join(targetRoot, '.work/im-it-answers-reviewed-preview.json'), answersDocument)
if (writeAnswers) writeJson(answersPath, answersDocument)

console.log(
  JSON.stringify({
    ...counts,
    autoGradeEligible: reviewDocument.autoGradeEligible,
    answersWritten: writeAnswers,
  }),
)
