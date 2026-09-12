'use client'

import { X } from '@sketchyicons/react'
import { LookupPanel } from '@/components/lexicon/lookup-panel'
import { Button } from '@/components/ui/button'
import type { PersonaProfile } from '@/types/lexicon'
import type { WordSource } from '@/types/storage'

export interface SelectedWord {
  term: string
  sentence: string
}

interface Props {
  selected: SelectedWord | null
  onClose: () => void
  persona?: PersonaProfile
  /** 存下來時記錄的出處類型，sentence 由 selected 帶入 */
  source: Omit<WordSource, 'sentence'>
  onSaveChange?: () => void
}

/**
 * 浮動查詞面板：桌機貼右側，手機從底部升起。
 *
 * 給版面窄的頁面用（題庫的 max-w-2xl 塞不下兩欄）。閱讀模式有自己的
 * 兩欄版面，不走這個。
 */
export function LookupSheet({ selected, onClose, persona, source, onSaveChange }: Props) {
  if (!selected) return null

  return (
    <>
      {/* 手機：底部抽屜 */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-xl border-t bg-background p-4 shadow-lg">
        <Header onClose={onClose} />
        <LookupPanel
          key={selected.term}
          term={selected.term}
          persona={persona}
          showInput={false}
          source={{ ...source, sentence: selected.sentence }}
          onSaveChange={onSaveChange}
        />
      </div>

      {/* 桌機：右側抽屜 */}
      <div className="hidden lg:block fixed right-4 top-20 z-40 w-[380px] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border bg-background p-4 shadow-lg">
        <Header onClose={onClose} />
        <LookupPanel
          key={selected.term}
          term={selected.term}
          persona={persona}
          showInput={false}
          source={{ ...source, sentence: selected.sentence }}
          onSaveChange={onSaveChange}
        />
      </div>
    </>
  )
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-end mb-2">
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} aria-label="關閉">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
