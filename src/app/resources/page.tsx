'use client'

import {
  BookOpen,
  Clapperboard,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  MessageCircle,
  Newspaper,
  PenLine,
  School,
  type SketchyIcon,
} from '@sketchyicons/react'
import { Suspense, useState } from 'react'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryState } from '@/hooks/use-query-state'
import { resources, resourceYear } from '@/lib/content'
import type { ExamId, ResourceType } from '@/types/content'

const TYPE_ICONS: Record<ResourceType, SketchyIcon> = {
  PTT: MessageCircle,
  HackMD: FileText,
  YouTube: Clapperboard,
  Notion: ClipboardList,
  補習班: School,
  書目: BookOpen,
  Dcard: MessageCircle,
  官方: Landmark,
  部落格: PenLine,
  線上課程: GraduationCap,
  時事: Newspaper,
}

const ALL_TYPES: ResourceType[] = [
  '書目',
  '補習班',
  'YouTube',
  '線上課程',
  'HackMD',
  'PTT',
  'Notion',
  '部落格',
  '官方',
  'Dcard',
  '時事',
]

const ALL_YEARS = [...new Set(resources.map((r) => resourceYear(r.title)).filter(Boolean))].sort(
  (a, b) => Number(b) - Number(a)
) as string[]

export default function ResourcesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResourcesContent />
    </Suspense>
  )
}

function ResourcesContent() {
  const [examFilter, setExamFilter] = useQueryState('exam', 'all')
  const [typeFilter, setTypeFilter] = useQueryState('type', 'all')
  const [yearFilter, setYearFilter] = useQueryState('year', 'all')
  const [query, setQuery] = useState('')

  const keyword = query.trim().toLowerCase()

  const filtered = resources.filter((r) => {
    const examMatch = examFilter === 'all' || r.examRelevance.includes(examFilter as ExamId)
    const typeMatch = typeFilter === 'all' || r.type === typeFilter
    const year = resourceYear(r.title)
    const yearMatch =
      yearFilter === 'all' || (yearFilter === 'none' ? year === null : year === yearFilter)
    const keywordMatch =
      !keyword ||
      r.title.toLowerCase().includes(keyword) ||
      (r.description?.toLowerCase().includes(keyword) ?? false)
    return examMatch && typeMatch && yearMatch && keywordMatch
  })

  const grouped = ALL_TYPES.reduce<Record<string, typeof resources>>((acc, type) => {
    const items = filtered.filter((r) => r.type === type)
    if (items.length) acc[type] = items
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display">資源庫</h1>
        <p className="text-muted-foreground text-sm mt-1">
          書目、補習班、YouTube、PTT、HackMD 等備考資源彙整
        </p>
      </div>

      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋標題與說明，例如：口試、洪逸、無補習、考古題"
        aria-label="搜尋資源"
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {(['all', 'im', 'cs'] as const).map((id) => (
            <Button
              key={id}
              variant={examFilter === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExamFilter(id)}
            >
              {id === 'all' ? '全部' : id === 'im' ? '資管所' : '資工所'}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={typeFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            全部類型
          </Button>
          {ALL_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t]
            return (
              <Button
                key={t}
                variant={typeFilter === t ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t}
              </Button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={yearFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setYearFilter('all')}
          >
            全部年份
          </Button>
          {ALL_YEARS.map((y) => (
            <Button
              key={y}
              variant={yearFilter === y ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setYearFilter(y)}
            >
              {y}
            </Button>
          ))}
          <Button
            variant={yearFilter === 'none' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setYearFilter('none')}
          >
            不分年
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">共 {filtered.length} 筆</p>

      {Object.entries(grouped).map(([type, items]) => {
        const Icon = TYPE_ICONS[type as ResourceType]
        return (
          <section key={type} className="space-y-2">
            <h2 className="text-base font-semibold flex items-center gap-1.5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>{type}</span>
            </h2>
            <ul className="space-y-2">
              {items.map((res) => (
                <li key={res.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {res.url ? (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            {res.title}
                            <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="font-medium">{res.title}</span>
                        )}
                        <div className="flex gap-1">
                          {res.examRelevance.map((e) => (
                            <Badge key={e} variant="outline" className="text-xs">
                              {e === 'im' ? '資管所' : '資工所'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {res.description && (
                        <p className="text-muted-foreground text-xs mt-1">{res.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>此篩選條件下沒有資源</p>
        </div>
      )}
    </div>
  )
}
