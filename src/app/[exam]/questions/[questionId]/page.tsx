'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import { QuestionGroupView } from '@/components/question-group-view'
import { SingleQuestionView } from '@/components/single-question-view'
import { getQuestionGroup, getQuestionsByExam } from '@/lib/content'
import { parseQuestion } from '@/lib/question-parser'
import type { ExamId, Question } from '@/types/content'

interface Props {
  params: Promise<{ exam: string; questionId: string }>
  searchParams: Promise<{ mode?: string; next?: string }>
}

function extractPassage(parentQuestion: Question): string {
  const parsed = parseQuestion(parentQuestion.text)
  const lines = parsed.stem.split('\n')
  const qLineIdx = lines.findIndex((line) =>
    new RegExp(`^\\s*${parentQuestion.number}\\.\\s`).test(line)
  )
  if (qLineIdx > 0) {
    return lines.slice(0, qLineIdx).join('\n').trim()
  }
  return parsed.stem
}

export default function DrillPage({ params, searchParams }: Props) {
  const { exam, questionId } = use(params)
  const { mode = 'drill', next } = use(searchParams)

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const question = allQuestions.find((candidate) => candidate.id === questionId)
  if (!question) notFound()

  const group = getQuestionGroup(question, allQuestions)

  if (group) {
    const passage = extractPassage(group.parentQuestion)
    const lastInGroup = group.questions[group.questions.length - 1]
    const nextAfterGroup = allQuestions
      .filter(
        (candidate) =>
          candidate.paperId === question.paperId && candidate.number > lastInGroup.number
      )
      .sort((a, b) => a.number - b.number)[0]

    return (
      <QuestionGroupView
        exam={exam}
        passage={passage}
        questions={group.questions}
        parentNumber={group.parentQuestion.number}
        mode={mode}
        nextQuestionId={nextAfterGroup?.id}
      />
    )
  }

  return <SingleQuestionView exam={exam} question={question} mode={mode} next={next} />
}
