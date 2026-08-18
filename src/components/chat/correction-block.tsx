'use client'

import { ChevronDown } from '@sketchyicons/react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CORRECTION_KIND_LABEL, type Correction } from '@/types/chat'

/**
 * 使用者訊息底下的訂正。預設收合 —— 對話的節奏比訂正重要，想看再展開。
 */
export function CorrectionBlock({ corrections }: { corrections: Correction[] }) {
  const [open, setOpen] = useState(false)

  if (corrections.length === 0) return null

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline dark:text-amber-400"
      >
        {open ? '收起訂正' : `${corrections.length} 處可以更好`}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-1.5 space-y-2 rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-2.5">
          {corrections.map((c) => (
            <div key={`${c.original}-${c.corrected}`} className="space-y-0.5">
              <div className="flex items-start gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs shrink-0">
                  {CORRECTION_KIND_LABEL[c.kind] ?? c.kind}
                </Badge>
                <span className="text-sm line-through text-muted-foreground">{c.original}</span>
                <span className="text-sm">→</span>
                <span className="text-sm font-medium">{c.corrected}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.zh}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
