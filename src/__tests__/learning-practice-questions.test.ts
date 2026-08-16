import { parseQuestion } from '@/lib/question-parser'
import { getQuestionPracticePolicy } from '@/lib/question-practice-policy'
import type { Question } from '@/types/content'
import answersRaw from '../../public/data/answers.json'
import lessonsRaw from '../../public/data/im-it-lessons.json'
import questionsRaw from '../../public/data/questions.json'

describe('learning practice question integrity', () => {
  test('keeps every IM-IT lesson question complete and auto-gradable', () => {
    const questions = new Map<string, Question>(
      questionsRaw.questions.map((question) => [question.id, question as Question])
    )
    const failures: string[] = []

    for (const lesson of lessonsRaw.lessons) {
      for (const questionId of lesson.pastPaperRefs) {
        const question = questions.get(questionId)
        const answer = answersRaw.answers[questionId as keyof typeof answersRaw.answers]
        if (!question) {
          failures.push(`${questionId}: missing question`)
          continue
        }

        const parsed = parseQuestion(question.text)
        if (!parsed.stem.trim()) failures.push(`${questionId}: empty stem`)
        if (!parsed.options || parsed.options.length < 2) {
          failures.push(`${questionId}: missing options`)
          continue
        }
        if (!answer) {
          failures.push(`${questionId}: missing answer`)
          continue
        }
        if (getQuestionPracticePolicy(question).gradingMode !== 'auto') {
          failures.push(`${questionId}: not auto-gradable`)
        }

        const answerLabel = answer.answer.toLowerCase()
        if (!parsed.options.some((option) => option.label === answerLabel)) {
          failures.push(`${questionId}: answer ${answer.answer} is not an option`)
        }
      }
    }

    expect(failures).toEqual([])
  })
})
