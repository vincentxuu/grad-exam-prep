'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PersonaProfile } from '@/types/lexicon'

interface Props {
  persona: PersonaProfile | undefined
  onChange: (persona: PersonaProfile) => void
}

/**
 * 個人化情境設定。填了之後例句會用這些情境改寫（痛點 4）。
 * 留白也能用，只是不會有「跟你的連結」那一區。
 */
export function PersonaForm({ persona, onChange }: Props) {
  const [work, setWork] = useState(persona?.work ?? '')
  const [goal, setGoal] = useState(persona?.goal ?? '')
  const [interests, setInterests] = useState<string[]>(persona?.interests ?? [])
  const [draft, setDraft] = useState('')

  function commit(next: Partial<PersonaProfile>) {
    onChange({ work, goal, interests, ...next })
  }

  function addInterest() {
    const value = draft.trim()
    if (!value || interests.includes(value)) {
      setDraft('')
      return
    }
    const next = [...interests, value]
    setInterests(next)
    setDraft('')
    commit({ interests: next })
  }

  function removeInterest(value: string) {
    const next = interests.filter((i) => i !== value)
    setInterests(next)
    commit({ interests: next })
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h2 className="text-sm font-medium">個人化情境</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          例句會用你填的情境改寫，字才記得住。留白也能查，只是少了這一層。
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
          目前先儲存在這台裝置；換手機前請到{' '}
          <Link href="/notes" className="underline underline-offset-2">
            雲端同步
          </Link>{' '}
          上傳，再到新手機下載。
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="persona-work" className="text-xs text-muted-foreground">
          職業／領域
        </label>
        <Input
          id="persona-work"
          value={work}
          onChange={(e) => setWork(e.target.value)}
          onBlur={() => commit({ work })}
          placeholder="例如：後端工程師"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="persona-interest" className="text-xs text-muted-foreground">
          興趣
        </label>
        <div className="flex gap-1.5">
          <Input
            id="persona-interest"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addInterest()
              }
            }}
            placeholder="打字後按 Enter 新增"
            className="h-8 text-sm"
          />
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addInterest}>
            新增
          </Button>
        </div>
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {interests.map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs rounded bg-muted px-2 py-0.5"
              >
                {i}
                <button
                  type="button"
                  onClick={() => removeInterest(i)}
                  aria-label={`移除 ${i}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="persona-goal" className="text-xs text-muted-foreground">
          學英文的目的（選填）
        </label>
        <Input
          id="persona-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onBlur={() => commit({ goal })}
          placeholder="例如：讀論文、準備研究所考試"
          className="h-8 text-sm"
        />
      </div>
    </div>
  )
}
