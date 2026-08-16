import answerReviewRaw from '../../public/data/im-it-answer-review.json'
import conceptMasterRaw from '../../public/data/im-it-concept-master.json'
import practiceStatusRaw from '../../public/data/im-it-practice-status.json'
import metadataRaw from '../../public/data/im-it-question-metadata.json'
import questionsRaw from '../../public/data/questions.json'
import subjectsRaw from '../../public/data/subjects-im.json'

const subject = subjectsRaw.find((entry) => entry.id === 'im-it')
const questions = questionsRaw.questions.filter((question) => question.subjectId === 'im-it')
const metadata = metadataRaw.questions

describe('IM information technology concept master', () => {
  test('uses the eight canonical subject topics and stable unique subtopics', () => {
    const subjectTopicIds = subject?.topics.map((topic) => topic.id) ?? []
    const masterTopicIds = conceptMasterRaw.topics.map((topic) => topic.id)
    const subtopics = conceptMasterRaw.topics.flatMap((topic) => topic.subtopics)

    expect(masterTopicIds).toEqual(subjectTopicIds)
    expect(conceptMasterRaw.canonicalTopicIds).toEqual(subjectTopicIds)
    expect(subtopics).toHaveLength(58)
    expect(new Set(subtopics.map((subtopic) => subtopic.id)).size).toBe(subtopics.length)
    expect(
      conceptMasterRaw.topics.flatMap((topic) =>
        topic.subtopics.filter(
          (subtopic) => subtopic.topicId !== topic.id || !subtopic.id.startsWith(`${topic.id}-`)
        )
      )
    ).toEqual([])
  })

  test('covers all 260 source questions exactly once', () => {
    const questionIds = questions.map((question) => question.id).sort()
    const metadataIds = metadata.map((entry) => entry.questionId).sort()

    expect(metadataRaw.totalQuestions).toBe(260)
    expect(metadata).toHaveLength(260)
    expect(new Set(metadataIds).size).toBe(260)
    expect(metadataIds).toEqual(questionIds)
  })

  test('keeps every taxonomy reference inside the concept master', () => {
    const topicIds = new Set(conceptMasterRaw.topics.map((topic) => topic.id))
    const subtopicIds = new Set(
      conceptMasterRaw.topics.flatMap((topic) => topic.subtopics.map((subtopic) => subtopic.id))
    )

    expect(
      metadata.filter(
        (entry) =>
          !topicIds.has(entry.topicId) ||
          !subtopicIds.has(entry.primarySubtopicId) ||
          !entry.primarySubtopicId.startsWith(`${entry.topicId}-`)
      )
    ).toEqual([])
  })

  test('locks the manually reviewed question-type baseline', () => {
    expect(metadataRaw.counts).toEqual({
      singleChoice: 246,
      codeImplementation: 11,
      shortExplanation: 3,
    })
    expect(metadata.filter((entry) => entry.questionType === 'single_choice')).toHaveLength(246)
    expect(metadata.filter((entry) => entry.questionType === 'code_implementation')).toHaveLength(
      11
    )
    expect(metadata.filter((entry) => entry.questionType === 'short_explanation')).toHaveLength(3)
  })

  test('publishes only technically reviewed, non-disputed choices for practice', () => {
    const choices = metadata.filter((entry) => entry.questionType === 'single_choice')
    const eligible = choices.filter((entry) => entry.publication.autoGradeEligible)
    const disputed = choices.filter((entry) => entry.answerConfidence.level === 'disputed')

    expect(answerReviewRaw.counts).toEqual({ confirmed: 182, corrected: 44, disputed: 20 })
    expect(answerReviewRaw.autoGradeEligible).toBe(226)
    expect(eligible).toHaveLength(226)
    expect(disputed).toHaveLength(20)
    expect(choices.filter((entry) => entry.answerSource.official)).toEqual([])
    expect(choices.filter((entry) => entry.publication.fullMockEligible)).toEqual([])
    expect(
      eligible.filter(
        (entry) =>
          entry.answerSource.kind !== 'model_assisted_technical_derivation' ||
          entry.answerConfidence.level !== 'medium' ||
          !entry.publication.practiceEligible
      )
    ).toEqual([])
  })

  test('keeps open and programming questions on self review', () => {
    const nonChoices = metadata.filter((entry) => entry.questionType !== 'single_choice')

    expect(nonChoices).toHaveLength(14)
    expect(
      nonChoices.filter(
        (entry) =>
          entry.scoringMode !== 'self_review' ||
          entry.publication.practiceEligible ||
          entry.publication.autoGradeEligible
      )
    ).toEqual([])
    expect(practiceStatusRaw.counts.selfReviewOnly).toBe(14)
  })

  test('reserves automatic scoring candidates for choice questions', () => {
    expect(
      metadata.filter((entry) =>
        entry.questionType === 'single_choice'
          ? entry.scoringMode !== 'automatic_candidate'
          : entry.scoringMode !== 'self_review'
      )
    ).toEqual([])
  })
})
