'use client'

import { notFound } from 'next/navigation'
import { Suspense, use } from 'react'
import { SemanticGroupBrowser } from '@/components/lexicon/semantic-group-browser'
import { PageLoading } from '@/components/page-loading'
import { EXAM_LABELS, getSubjectsByExam } from '@/lib/content'
import type { ExamId } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

export default function WordWebPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <WordWebContent {...props} />
    </Suspense>
  )
}

function WordWebContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  return <SemanticGroupBrowser examLabel={EXAM_LABELS[exam as ExamId]} />
}
