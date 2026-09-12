'use client'

import { useId, useState } from 'react'
import type { QuestionRubricItem } from '@/lib/question-review'

interface Props {
  items: QuestionRubricItem[]
}

export function QuestionSelfReviewRubric({ items }: Props) {
  const headingId = useId()
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set())
  if (items.length === 0) return null

  const totalPoints = items.reduce((sum, item) => sum + item.points, 0)
  const checkedPoints = items.reduce(
    (sum, item) => sum + (checkedIds.has(item.id) ? item.points : 0),
    0
  )

  return (
    <section className="space-y-3 rounded-lg border bg-muted/20 p-4" aria-labelledby={headingId}>
      <div>
        <h3 id={headingId} className="text-sm font-semibold">
          逐項自評 rubric
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          先比對自己的推導或論證，再勾選確實做到的項目。這不是官方配分或系統自動成績。
        </p>
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const checked = checkedIds.has(item.id)
          return (
            <li key={item.id} className="rounded-md border bg-background p-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setCheckedIds((current) => {
                      const next = new Set(current)
                      if (event.target.checked) next.add(item.id)
                      else next.delete(item.id)
                      return next
                    })
                  }}
                  aria-label={`完成自評：${item.label}`}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3 text-sm font-medium">
                    <span>{item.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.points} 分
                    </span>
                  </span>
                  <span className="mt-2 block space-y-1 text-xs leading-5 text-muted-foreground">
                    {item.criteria.map((criterion) => (
                      <span key={criterion} className="block">
                        · {criterion}
                      </span>
                    ))}
                  </span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <p className="text-right text-xs font-medium tabular-nums text-muted-foreground">
        已確認 {checkedPoints} / {totalPoints} 分的作答要素
      </p>
    </section>
  )
}
