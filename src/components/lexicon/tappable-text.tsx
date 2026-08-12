'use client'

import { useMemo } from 'react'
import { sentenceAt, tokenize } from '@/lib/reading/tokenize'
import { cn } from '@/lib/utils'

export type WordMark = 'saved' | 'weak' | null

interface Props {
  text: string
  /** 點一個字或拖曳選一段片語時觸發 */
  onSelect: (term: string, sentence: string) => void
  /** 這個字要不要標記（已收藏／上次評不會） */
  mark?: (word: string) => WordMark
  /** 目前正在查的字，會highlight起來 */
  activeTerm?: string
  className?: string
}

/**
 * 讓一段文字裡的每個英文字都可以點來查詞。
 *
 * 閱讀模式、題庫、之後的對話模式共用同一份實作 —— 不要為了各自的版面
 * 再寫一次切詞與點擊處理。
 */
export function TappableText({ text, onSelect, mark, activeTerm, className }: Props) {
  const tokens = useMemo(() => tokenize(text), [text])

  function handleWordClick(word: string, start: number, end: number) {
    // 拖曳選取時 mouseup 也會落在某個字上，交給 handleMouseUp 處理片語
    const sel = typeof window !== 'undefined' ? window.getSelection() : null
    if (sel && !sel.isCollapsed && sel.toString().trim().includes(' ')) return

    onSelect(word, sentenceAt(text, start, end))
  }

  /** 拖曳選取多個字 → 當成片語查（筆記兩次提到片語） */
  function handleMouseUp() {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null
    if (!sel || sel.isCollapsed) return

    const picked = sel.toString().trim()
    if (!picked.includes(' ')) return

    const at = text.indexOf(picked)
    onSelect(picked, at >= 0 ? sentenceAt(text, at, at + picked.length) : picked)
  }

  return (
    // 容器層的 mouseup 負責處理拖曳選取的片語；個別的字本身是可聚焦的 button
    <span className={className} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      {tokens.map((t) => {
        if (!t.isWord) return <span key={t.start}>{t.text}</span>

        const state = mark?.(t.text) ?? null
        const isActive = !!activeTerm && activeTerm.toLowerCase() === t.text.toLowerCase()

        return (
          <button
            key={t.start}
            type="button"
            onClick={() => handleWordClick(t.text, t.start, t.end)}
            className={cn(
              'inline cursor-pointer rounded-sm px-0 hover:bg-primary/15 transition-colors',
              state === 'saved' && 'underline decoration-green-500 decoration-2 underline-offset-2',
              state === 'weak' && 'underline decoration-amber-500 decoration-2 underline-offset-2',
              isActive && 'bg-primary/20'
            )}
          >
            {t.text}
          </button>
        )
      })}
    </span>
  )
}

/** 標記說明，放在可點文字附近。 */
export function TappableLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
      <span>點任一個字查詞，拖曳選取查片語</span>
      <span className="inline-flex items-center gap-1">
        <span className="underline decoration-green-500 decoration-2 underline-offset-2">
          已收藏
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="underline decoration-amber-500 decoration-2 underline-offset-2">
          還不熟
        </span>
      </span>
    </div>
  )
}
