'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { InteractiveReveal as InteractiveRevealType } from '@/lib/learning'

export function InteractiveReveal({ prompt, answer }: InteractiveRevealType) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="text-sm font-medium">{prompt}</p>
      {revealed ? (
        <p className="mt-3 rounded-md bg-amber-100/80 px-3 py-2 text-sm leading-6 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          {answer}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={cn(
            'mt-3 inline-flex items-center rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors',
            'hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900'
          )}
        >
          想一想，再點開看答案
        </button>
      )}
    </div>
  )
}
