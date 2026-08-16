import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LearningLessonContent } from '@/components/exam/learning-lesson-content'
import { getLearningCatalog, getLearningCatalogs } from '@/lib/learning-catalog'

interface Props {
  params: Promise<{ exam: string; subjectId: string; lessonId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam, subjectId, lessonId } = await params
  const lesson = getLearningCatalog(exam, subjectId)?.getLesson(lessonId)
  return { title: lesson ? `${lesson.title} | 台大研所備考` : '找不到頁面' }
}

export default async function LearningLessonPage({ params }: Props) {
  const { exam, subjectId, lessonId } = await params
  const catalog = getLearningCatalog(exam, subjectId)
  const lesson = catalog?.getLesson(lessonId)

  if (!catalog || !lesson) notFound()

  const cards = catalog.getCardsForLesson(lesson.id)
  const sources = catalog.getSources(lesson.sourceRefs)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav
        aria-label="麵包屑"
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href={`/${catalog.examId}`} className="hover:text-foreground">
          {catalog.examLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/${catalog.examId}/subjects/${catalog.subjectId}`}
          className="hover:text-foreground"
        >
          {catalog.subjectLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{catalog.moduleLabel}</span>
      </nav>

      <LearningLessonContent catalog={catalog} lesson={lesson} cards={cards} sources={sources} />
    </div>
  )
}

export function generateStaticParams() {
  return getLearningCatalogs().flatMap((catalog) =>
    catalog.lessons.map((lesson) => ({
      exam: catalog.examId,
      subjectId: catalog.subjectId,
      lessonId: lesson.id,
    }))
  )
}
