import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exams, getSubjectsByExam } from '@/lib/content'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-3 py-6">
        <h1 className="text-3xl font-bold tracking-tight">台大研所備考</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          台大資管所 & 資工所完整備考資源：科目主題樹、備考時程、閃卡練習、考古題索引
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const subjects = getSubjectsByExam(exam.id)
          const latest = exam.admissions[0]
          return (
            <Link key={exam.id} href={`/${exam.id}`} className="block group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{exam.name}</span>
                    <Badge variant="outline">代碼 {exam.code}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {exam.format.writtenWeight}% 筆試
                    {exam.format.oralWeight ? ` · ${exam.format.oralWeight}% 口試` : ' · 100% 筆試'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Stat label="錄取率" value={`≈ ${latest.admissionRate}%`} />
                    <Stat label={`${latest.year}正取`} value={`${latest.acceptedMain} 名`} />
                    <Stat
                      label={`${latest.year}報名`}
                      value={`${latest.applicants?.toLocaleString()}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">考科</p>
                    <div className="flex flex-wrap gap-1">
                      {subjects.map((s) => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.name.split('（')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
        <QuickLink href="/compare" icon="⚖️" label="兩所比較" desc="考試形式、難度、適合對象" />
        <QuickLink href="/resources" icon="📚" label="資源庫" desc="補習班、書目、YouTube、PTT" />
        <QuickLink href="/im" icon="📅" label="備考計畫" desc="8個月完整時程規劃" />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function QuickLink({
  href,
  icon,
  label,
  desc,
}: {
  href: string
  icon: string
  label: string
  desc: string
}) {
  return (
    <Link href={href} className="block p-4 rounded-lg border hover:bg-accent transition-colors">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-xs mt-0.5">{desc}</div>
    </Link>
  )
}
