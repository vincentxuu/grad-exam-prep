'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { InteractiveQuiz as InteractiveQuizType } from '@/lib/learning'

export function InteractiveQuiz({ prompt, options }: InteractiveQuizType) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null

  return (
    <div className="rounded-lg border-2 border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/30">
      <p className="text-sm font-medium">{prompt}</p>
      <div className="mt-3 space-y-2">
        {options.map((option, i) => {
          const isSelected = selected === i
          const showCorrect = answered && option.correct
          const showWrong = isSelected && !option.correct

          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                !answered && 'hover:border-sky-400 hover:bg-sky-100/50 dark:hover:border-sky-600 dark:hover:bg-sky-900/30',
                answered && 'cursor-default',
                showCorrect && 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30',
                showWrong && 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30',
                !showCorrect && !showWrong && answered && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  showCorrect && 'border-emerald-500 bg-emerald-500 text-white',
                  showWrong && 'border-red-400 bg-red-400 text-white',
                  !showCorrect && !showWrong && 'border-muted-foreground/30'
                )}
              >
                {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={cn(
          'mt-3 rounded-md px-3 py-2 text-sm leading-6',
          options[selected].correct
            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100'
            : 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100'
        )}>
          {options[selected].explanation}
        </p>
      )}
    </div>
  )
}
