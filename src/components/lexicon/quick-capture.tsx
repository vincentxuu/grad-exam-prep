'use client'

import { Check, Plus, Search } from '@sketchyicons/react'
import { useEffect, useRef, useState } from 'react'
import { LookupPanel } from '@/components/lexicon/lookup-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { isAuthenticated } from '@/lib/auth'
import { lexiconCardId } from '@/lib/lexicon/normalize'
import { addSavedWordServer } from '@/lib/server-storage'
import { localStorageImpl } from '@/lib/storage'
import type { PersonaProfile } from '@/types/lexicon'

export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [expandLookup, setExpandLookup] = useState<string | null>(null)
  const [persona, setPersona] = useState<PersonaProfile | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPersona(localStorageImpl.getState().preferences.persona)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

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

  function addWord(raw: string) {
    const headword = raw.trim().toLowerCase()
    if (!headword) return

    const word = {
      headword,
      cardId: lexiconCardId(headword),
      addedAt: Date.now(),
      source: { kind: 'manual' as const },
    }
    localStorageImpl.addSavedWord(word)
    if (isAuthenticated()) addSavedWordServer(word).catch(() => {})

    setJustAdded(headword)
    setTerm('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function close(next: boolean) {
    setOpen(next)
    if (!next) {
      setTerm('')
      setJustAdded(null)
      setExpandLookup(null)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 shrink-0 gap-1"
        title="快速加字（Ctrl/⌘ + K）"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline text-xs">加字</span>
      </Button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>快速加字</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              addWord(term)
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => {
                setTerm(e.target.value)
                setJustAdded(null)
              }}
              placeholder="打字 + Enter 即加入單字庫"
              autoComplete="off"
              className="flex-1 bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button type="submit" size="sm" disabled={!term.trim()}>
              加入
            </Button>
          </form>

          {justAdded && !expandLookup && (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 px-3 py-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" aria-hidden="true" />
              <span className="text-sm">
                <strong>{justAdded}</strong> 已加入，會在下次閃卡出現
              </span>
              <button
                type="button"
                onClick={() => setExpandLookup(justAdded)}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Search className="h-3 w-3" aria-hidden="true" />
                查看詞條
              </button>
            </div>
          )}

          {expandLookup && (
            <div className="space-y-2">
              <LookupPanel
                key={expandLookup}
                term={expandLookup}
                persona={persona}
                source={{ kind: 'manual' }}
                showInput={false}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setExpandLookup(null)
                  setJustAdded(null)
                  inputRef.current?.focus()
                }}
              >
                繼續加字
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Enter 立即收藏，不用等 AI。想看詳細解釋再點「查看詞條」。
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
