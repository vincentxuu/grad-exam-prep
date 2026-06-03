import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Exam } from '@/types/content'
import { PendingBadge } from './pending-badge'

interface AdmissionsCardProps {
  exam: Exam
}

export function AdmissionsCard({ exam }: AdmissionsCardProps) {
  const latest = exam.admissions[0]
  const prev = exam.admissions[1]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">招生數據</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label={`${latest.year}學年度報名`}
            value={`${latest.applicants?.toLocaleString() ?? '—'} 人`}
          />
          <Stat label={`${latest.year}學年度正取`} value={`${latest.acceptedMain ?? '—'} 名`} />
          <Stat label={`${latest.year}學年度錄取率`} value={`≈ ${latest.admissionRate}%`} />
          <div>
            <p className="text-muted-foreground text-xs">{latest.year}學年最低分</p>
            <div className="flex items-center gap-1 mt-0.5">
              {latest.pending ? (
                <PendingBadge label="待放榜" />
              ) : (
                <span className="font-medium">{latest.lowestScore ?? '—'}</span>
              )}
            </div>
          </div>
        </div>

        {prev && (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            <span>{prev.year}學年：</span>
            <span>{prev.applicants?.toLocaleString()}人報名</span>
            {prev.lowestScore && <span> · 最低 {prev.lowestScore}</span>}
          </div>
        )}

        {exam.admissionsPending && (
          <p className="text-xs text-muted-foreground border-t pt-2">{exam.admissionsPending}</p>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
