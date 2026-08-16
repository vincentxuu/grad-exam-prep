import { spawnSync } from 'node:child_process'
import answerReviewRaw from '../../public/data/cs-arch-answer-review.json'
import cardsRaw from '../../public/data/cs-arch-concept-cards.json'
import lessonsRaw from '../../public/data/cs-arch-lessons.json'
import metadataRaw from '../../public/data/cs-arch-question-metadata.json'
import sourcesRaw from '../../public/data/cs-arch-source-registry.json'

describe('cs-arch Pipeline draft learning slice', () => {
  test('stays a minimal unpublished draft with closed evidence', () => {
    expect(lessonsRaw.subjectId).toBe('cs-arch')
    expect(lessonsRaw.status).toBe('draft')
    expect(lessonsRaw.counts).toEqual({ lessons: 1, coveredSubtopics: 3, coveredQuestions: 6 })
    expect(lessonsRaw.lessons).toHaveLength(1)
    expect(lessonsRaw.lessons[0].reviewStatus).toBe('draft')
    expect(lessonsRaw.lessons[0].publication.publishEligible).toBe(false)
    expect(lessonsRaw.lessons[0].pastPaperRefs).toHaveLength(6)
  })

  test('keeps all candidate answers non-official and unavailable to grading', () => {
    expect(answerReviewRaw.officialAnswerKeyAvailable).toBe(false)
    expect(answerReviewRaw.autoGradeEligible).toBe(0)
    expect(answerReviewRaw.questions).toHaveLength(6)
    expect(answerReviewRaw.questions.every((entry) => !entry.official)).toBe(true)
    expect(answerReviewRaw.questions.every((entry) => entry.approvedAnswer === null)).toBe(true)
    expect(answerReviewRaw.questions.every((entry) => !entry.autoGradeEligible)).toBe(true)
    expect(metadataRaw.questions.every((entry) => entry.scoringMode === 'self_review')).toBe(true)
    expect(metadataRaw.questions.every((entry) => !entry.publication.autoGradeEligible)).toBe(true)
  })

  test('preserves disputed timing questions and eight draft cards', () => {
    const reviews = new Map(answerReviewRaw.questions.map((entry) => [entry.questionId, entry]))

    expect(reviews.get('q-pp-cs-arch-112-7')?.status).toBe('disputed')
    expect(reviews.get('q-pp-cs-arch-114-12')?.status).toBe('disputed')
    expect(reviews.get('q-pp-cs-arch-110-7')?.status).toBe('self_review_only')
    expect(cardsRaw.totalCards).toBe(8)
    expect(cardsRaw.cards).toHaveLength(8)
    expect(cardsRaw.cards.every((card) => card.reviewStatus === 'draft')).toBe(true)
  })

  test('closes every lesson, card, and answer source reference', () => {
    const sourceIds = new Set(sourcesRaw.sources.map((source) => source.id))
    const lesson = lessonsRaw.lessons[0]

    expect(lesson.sourceRefs.every((id) => sourceIds.has(id))).toBe(true)
    expect(cardsRaw.cards.flatMap((card) => card.sourceRefs).every((id) => sourceIds.has(id))).toBe(
      true
    )
    expect(
      answerReviewRaw.questions
        .flatMap((entry) => entry.sourceRefs)
        .every((id) => sourceIds.has(id))
    ).toBe(true)
  })

  test('passes builder drift check and focused validator', () => {
    const build = spawnSync('node', ['scripts/build-cs-arch-pipeline-artifacts.mjs'], {
      encoding: 'utf8',
    })
    const validate = spawnSync('node', ['scripts/validate-cs-arch-pipeline-artifacts.mjs'], {
      encoding: 'utf8',
    })

    expect(build.stderr).toBe('')
    expect(build.status).toBe(0)
    expect(validate.stderr).toBe('')
    expect(validate.status).toBe(0)
  })
})
