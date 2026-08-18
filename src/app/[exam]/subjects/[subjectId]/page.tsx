import {
  BookOpen,
  Clapperboard,
  ExternalLink,
  Globe,
  NotebookPen,
  School,
  type SketchyIcon,
} from '@sketchyicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnglishPracticeRoute } from '@/components/exam/english-practice-route'
import { ItPracticeRoute } from '@/components/exam/it-practice-route'
import { LearningConceptOverview } from '@/components/exam/learning-concept-overview'
import { MisPracticeRoute } from '@/components/exam/mis-practice-route'
import { StatPracticeRoute } from '@/components/exam/stat-practice-route'
import { TopicTree } from '@/components/exam/topic-tree'
import { Badge } from '@/components/ui/badge'
import { EXAM_LABELS, getExam, getSubject, subjects } from '@/lib/content'
import { getLearningCatalog } from '@/lib/learning-catalog'
import type { ExamId } from '@/types/content'

const PRACTICE_ROUTES: Record<string, React.ComponentType> = {
  'im-it': ItPracticeRoute,
  'im-mis': MisPracticeRoute,
  'im-stat': StatPracticeRoute,
  'im-english': EnglishPracticeRoute,
}

const MATERIAL_TYPE_META: Record<string, { label: string; icon: SketchyIcon }> = {
  book: { label: '書目', icon: BookOpen },
  notes: { label: '講義', icon: NotebookPen },
  video: { label: '影片', icon: Clapperboard },
  online: { label: '線上', icon: Globe },
  'cram-school': { label: '補習班', icon: School },
}

interface Props {
  params: Promise<{ exam: string; subjectId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params
  const subject = getSubject(subjectId)
  return { title: subject ? `${subject.name} | 台大研所備考` : '找不到頁面' }
}

export default async function SubjectPage({ params }: Props) {
  const { exam, subjectId } = await params
  const examData = getExam(exam as ExamId)
  const subject = getSubject(subjectId)
  const learningCatalog = getLearningCatalog(exam, subjectId)

  if (!examData || !subject || subject.examId !== exam) notFound()

  const PracticeRoute = exam === 'im' ? PRACTICE_ROUTES[subjectId] : undefined

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${exam}`} className="hover:text-foreground">
          {EXAM_LABELS[exam as ExamId]}
        </Link>
        <span>/</span>
        <span className="text-foreground">{subject.name}</span>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-display">{subject.name}</h1>
          {subject.weight != null && <Badge variant="secondary">加權 {subject.weight}%</Badge>}
        </div>
        <p className="text-muted-foreground text-sm mt-1">{subject.topics.length} 個主題</p>
      </div>

      {PracticeRoute && <PracticeRoute />}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">主題樹（依重要度排序）</h2>
        {learningCatalog?.overview ? (
          <LearningConceptOverview catalog={learningCatalog} />
        ) : (
          <div className="rounded-lg border p-4">
            <TopicTree topics={subject.topics} />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">推薦教材</h2>
        {subject.materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚無教材資料</p>
        ) : (
          <ul className="space-y-2">
            {subject.materials.map((mat, i) => {
              const materialMeta = MATERIAL_TYPE_META[mat.type]
              const MaterialIcon = materialMeta?.icon
              return (
                <li key={i} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5 gap-1 text-xs">
                    {MaterialIcon && <MaterialIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                    {materialMeta?.label ?? mat.type}
                  </Badge>
                  <div>
                    <p className="font-medium">{mat.title}</p>
                    {mat.author && (
                      <p className="text-xs text-muted-foreground">作者：{mat.author}</p>
                    )}
                    {mat.note && <p className="text-xs text-muted-foreground mt-0.5">{mat.note}</p>}
                    {mat.url && (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        前往連結
                        <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export function generateStaticParams() {
  return subjects.map((s) => ({ exam: s.examId, subjectId: s.id }))
}
