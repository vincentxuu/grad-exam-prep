'use client'

import { useState } from 'react'
import type { InteractiveSlider as InteractiveSliderType } from '@/lib/learning'

function evalFormula(formula: string, values: Record<string, number>): number {
  const keys = Object.keys(values)
  const vals = Object.values(values)
  const fn = new Function(...keys, `return ${formula}`)
  return fn(...vals)
}

export function InteractiveSlider({ title, sliders, formula, resultLabel }: InteractiveSliderType) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of sliders) init[s.id] = s.initial
    return init
  })

  let result: number
  try {
    result = evalFormula(formula, values)
  } catch {
    result = NaN
  }

  return (
    <div className="rounded-lg border-2 border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/30">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-3">
        {sliders.map((s) => (
          <div key={s.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor={`slider-${s.id}`} className="text-muted-foreground">{s.label}</label>
              <span className="tabular-nums font-medium">
                {Number.isInteger(s.step) ? values[s.id] : values[s.id].toFixed(2)}
              </span>
            </div>
            <input
              id={`slider-${s.id}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={values[s.id]}
              onChange={(e) => setValues((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
              className="w-full accent-violet-600 dark:accent-violet-400"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md bg-violet-100 px-3 py-2 dark:bg-violet-900/40">
        <span className="text-sm text-violet-800 dark:text-violet-200">{resultLabel}</span>
        <span className="ml-2 text-lg font-bold tabular-nums text-violet-900 dark:text-violet-100">
          {Number.isNaN(result) ? '—' : result.toFixed(4)}
        </span>
      </div>
    </div>
  )
}
