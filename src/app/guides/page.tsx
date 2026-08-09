'use client'

import { Suspense } from 'react'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQueryState } from '@/hooks/use-query-state'
import { EXAM_LABELS, guides } from '@/lib/content'
import type { ExamId } from '@/types/content'

export default function GuidesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <GuidesContent />
    </Suspense>
  )
}

function GuidesContent() {
  const [examFilter, setExamFilter] = useQueryState('exam', 'all')

  const filtered = guides.filter(
    (g) => examFilter === 'all' || g.examRelevance.includes(examFilter as ExamId)
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">上榜心得導讀</h1>
        <p className="text-muted-foreground text-sm mt-1">
          這裡只說明每篇心得涵蓋哪些主題，方便你決定要不要點進去。內容請至原文閱讀，著作權屬各原作者所有。
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'im', 'cs'] as const).map((id) => (
          <Button
            key={id}
            variant={examFilter === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setExamFilter(id)}
          >
            {id === 'all' ? '全部' : EXAM_LABELS[id]}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-1">{filtered.length} 篇</span>
      </div>

      <div className="space-y-4">
        {filtered.map((guide) => (
          <article key={guide.id} className="rounded-lg border p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold leading-snug">{guide.title}</h2>
                <div className="flex gap-1 shrink-0">
                  {guide.examRelevance.map((e) => (
                    <Badge key={e} variant="outline" className="text-xs">
                      {EXAM_LABELS[e]}
                    </Badge>
                  ))}
                </div>
              </div>
              {guide.subtitle && <p className="text-sm text-muted-foreground">{guide.subtitle}</p>}
              <div className="flex flex-wrap gap-1">
                {guide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">這篇談到</p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {guide.topics.map((topic) => (
                  <li key={topic} className="flex gap-2 text-sm leading-6">
                    <span className="text-primary shrink-0">•</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap border-t pt-3">
              <p className="text-xs text-muted-foreground">
                {guide.source.platform}
                {guide.source.author ? ` · ${guide.source.author}` : ''}
              </p>
              <a
                href={guide.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                到 {guide.source.platform.split(' ')[0]} 閱讀原文 →
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>此篩選條件下沒有心得</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground border-t pt-4">
        更多各年度心得文、開放式課程與書目整理在
        <a href="/resources" className="text-primary hover:underline mx-1">
          資源庫
        </a>
        。
      </p>
    </div>
  )
}
