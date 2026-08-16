import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImItLessonContent } from '@/components/exam/im-it-lesson-content'
import {
  getImItCardsForLesson,
  getImItLesson,
  getImItLessons,
  getImItSources,
} from '@/lib/im-it-learning'

interface Props {
  params: Promise<{ exam: string; subjectId: string; lessonId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam, subjectId, lessonId } = await params
  const lesson = exam === 'im' && subjectId === 'im-it' ? getImItLesson(lessonId) : undefined
  return { title: lesson ? `${lesson.title} | 台大研所備考` : '找不到頁面' }
}

export default async function ImItLessonPage({ params }: Props) {
  const { exam, subjectId, lessonId } = await params
  const lesson = exam === 'im' && subjectId === 'im-it' ? getImItLesson(lessonId) : undefined

  if (!lesson) notFound()

  const cards = getImItCardsForLesson(lesson.id)
  const sources = getImItSources(lesson.sourceRefs)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav
        aria-label="麵包屑"
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/im" className="hover:text-foreground">
          資管所
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/im/subjects/im-it" className="hover:text-foreground">
          資訊科技概論
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">學習模組</span>
      </nav>

      <ImItLessonContent lesson={lesson} cards={cards} sources={sources} />
    </div>
  )
}

export function generateStaticParams() {
  return getImItLessons().map((lesson) => ({
    exam: 'im',
    subjectId: 'im-it',
    lessonId: lesson.id,
  }))
}
