import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EXAM_LABELS, guides } from '@/lib/content'

export const metadata: Metadata = {
  title: '上榜心得 | 台大研所備考',
  description: '歷屆上榜生的備考策略、各科準備方式與心態整理',
}

export default function GuidesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">上榜心得</h1>
        <p className="text-muted-foreground text-sm mt-1">
          把公開分享的上榜心得整理成可執行的策略：時間分配、各科準備方式、工具用法與心態
        </p>
      </div>

      <div className="space-y-4">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/guides/${guide.id}`} className="block group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    {guide.examRelevance.map((e) => (
                      <Badge key={e} variant="outline" className="text-xs">
                        {EXAM_LABELS[e]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardDescription>{guide.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-6">{guide.summary}</p>
                <div className="flex flex-wrap gap-1">
                  {guide.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  出處：{guide.source.platform}
                  {guide.source.author ? ` · ${guide.source.author}` : ''}
                  {guide.readingMinutes ? ` · 約 ${guide.readingMinutes} 分鐘讀完` : ''}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {guides.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>目前還沒有整理好的心得</p>
        </div>
      )}
    </div>
  )
}
