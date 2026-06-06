'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQueryState } from '@/hooks/use-query-state'
import { resources } from '@/lib/content'
import type { ExamId, ResourceType } from '@/types/content'

const TYPE_ICONS: Record<ResourceType, string> = {
  PTT: '💬',
  HackMD: '📄',
  YouTube: '🎬',
  Notion: '📋',
  補習班: '🏫',
  書目: '📖',
  Dcard: '💬',
  官方: '🏛️',
}

const ALL_TYPES: ResourceType[] = [
  '書目',
  '補習班',
  'YouTube',
  'HackMD',
  'PTT',
  'Notion',
  '官方',
  'Dcard',
]

export default function ResourcesPage() {
  const [examFilter, setExamFilter] = useQueryState('exam', 'all')
  const [typeFilter, setTypeFilter] = useQueryState('type', 'all')

  const filtered = resources.filter((r) => {
    const examMatch = examFilter === 'all' || r.examRelevance.includes(examFilter as ExamId)
    const typeMatch = typeFilter === 'all' || r.type === typeFilter
    return examMatch && typeMatch
  })

  const grouped = ALL_TYPES.reduce<Record<string, typeof resources>>((acc, type) => {
    const items = filtered.filter((r) => r.type === type)
    if (items.length) acc[type] = items
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">資源庫</h1>
        <p className="text-muted-foreground text-sm mt-1">
          書目、補習班、YouTube、PTT、HackMD 等備考資源彙整
        </p>
      </div>

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
          {ALL_TYPES.map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(t)}
            >
              {TYPE_ICONS[t]} {t}
            </Button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <section key={type} className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-1.5">
            <span>{TYPE_ICONS[type as ResourceType]}</span>
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
                          {res.title} →
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
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>此篩選條件下沒有資源</p>
        </div>
      )}
    </div>
  )
}
