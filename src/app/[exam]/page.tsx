import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdmissionsCard } from '@/components/exam/admissions-card'
import { SubjectCard } from '@/components/exam/subject-card'
import { EXAM_LABELS, getExam, getSubjectsByExam } from '@/lib/content'
import type { ExamId } from '@/types/content'

interface Props {
  params: Promise<{ exam: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params
  const label = EXAM_LABELS[exam as ExamId]
  return { title: label ? `${label} | 台大研所備考` : '找不到頁面' }
}

export default async function ExamPage({ params }: Props) {
  const { exam } = await params
  const examData = getExam(exam as ExamId)
  if (!examData) notFound()

  const subjects = getSubjectsByExam(exam as ExamId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{examData.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{examData.format.note}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">考科總覽</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                href={`/${exam}/subjects/${subject.id}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AdmissionsCard exam={examData} />

          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <h3 className="font-medium">考試形式</h3>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>筆試</span>
                <span className="font-medium text-foreground">
                  {examData.format.writtenWeight}%
                </span>
              </div>
              {examData.format.oralWeight && (
                <div className="flex justify-between">
                  <span>口試</span>
                  <span className="font-medium text-foreground">{examData.format.oralWeight}%</span>
                </div>
              )}
              {examData.format.oralThreshold && (
                <p className="text-xs">口試門檻 {examData.format.oralThreshold} 分</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-1 text-sm">
            <h3 className="font-medium mb-2">資料來源</h3>
            {examData.sourceNotes?.map((note, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {note}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return [{ exam: 'im' }, { exam: 'cs' }]
}
