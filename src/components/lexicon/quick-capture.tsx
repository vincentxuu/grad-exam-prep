'use client'

import { Plus } from '@sketchyicons/react'
import { useEffect, useState } from 'react'
import { LookupPanel } from '@/components/lexicon/lookup-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { localStorageImpl } from '@/lib/storage'
import type { PersonaProfile } from '@/types/lexicon'
import type { WordSource } from '@/types/storage'

const KIND_OPTIONS: { value: WordSource['kind']; label: string }[] = [
  { value: 'manual', label: '其他' },
  { value: 'course', label: '課程／家教' },
  { value: 'book', label: '書籍' },
  { value: 'reading', label: '文章' },
]

/**
 * 全站都在的「快速加字」。
 *
 * 對應筆記裡沒有文章可貼的來源：app、課程、家教 —— 那些場合只有一個
 * 聽到的字。出處與註記都是選填，因為捕捉如果不能在三秒內完成，課堂上
 * 就不會有人用；抓到半套也好過整個漏掉。
 */
export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [kind, setKind] = useState<WordSource['kind']>('manual')
  const [persona, setPersona] = useState<PersonaProfile | undefined>()

  useEffect(() => {
    if (open) setPersona(localStorageImpl.getState().preferences.persona)
  }, [open])

  // 全站快捷鍵。輸入框裡按不觸發，不然打字就沒辦法了。
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (typing) return

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function reset() {
    setTerm('')
    setSubmitted(null)
    setLabel('')
    setKind('manual')
  }

  function close(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  const source: WordSource = { kind, label: label.trim() || undefined }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 shrink-0 gap-1"
        title="快速加字（Ctrl/⌘ + K）"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline text-xs">加字</span>
      </Button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>快速加字</DialogTitle>
            <DialogDescription>
              課堂上、家教時、滑手機看到的字，打進來就好。出處可以之後再補。
            </DialogDescription>
          </DialogHeader>

          {!submitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const value = term.trim()
                if (value) setSubmitted(value)
              }}
              className="space-y-3"
            >
              <Input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="單字或片語"
                className="text-sm"
              />

              <div className="flex flex-wrap gap-1.5">
                {KIND_OPTIONS.map((o) => (
                  <Button
                    key={o.value}
                    type="button"
                    size="sm"
                    variant={kind === o.value ? 'secondary' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setKind(o.value)}
                  >
                    {o.label}
                  </Button>
                ))}
              </div>

              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="出處（選填）例如：某某課、某本書"
                className="h-8 text-xs"
              />

              <Button type="submit" size="sm" disabled={!term.trim()}>
                查詢
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <LookupPanel
                key={submitted}
                term={submitted}
                persona={persona}
                source={source}
                showInput={false}
              />
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={reset}>
                再加一個
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
