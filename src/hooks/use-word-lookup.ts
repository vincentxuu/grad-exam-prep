'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SelectedWord } from '@/components/lexicon/lookup-sheet'
import type { WordMark } from '@/components/lexicon/tappable-text'
import { buildWordMarks } from '@/lib/reading/word-marks'
import { localStorageImpl } from '@/lib/storage'
import type { PersonaProfile } from '@/types/lexicon'

/**
 * 可點文字 + 查詞面板的共用狀態。
 *
 * 閱讀模式、題庫、題組文章都需要同一組東西：選中的字、persona、以及
 * 收藏後要重畫的底線標記。集中在這裡，呼叫端只要接上去。
 */
export function useWordLookup(enabled = true) {
  const [selected, setSelected] = useState<SelectedWord | null>(null)
  const [persona, setPersona] = useState<PersonaProfile | undefined>()
  const [mark, setMark] = useState<(word: string) => WordMark>(() => () => null)

  // setState 的更新函式形式：回傳的才是要存的值，所以外面要多包一層
  const refreshMarks = useCallback(() => {
    const fn = buildWordMarks()
    setMark(() => fn)
  }, [])

  useEffect(() => {
    if (!enabled) return
    setPersona(localStorageImpl.getState().preferences.persona)
    refreshMarks()
  }, [enabled, refreshMarks])

  const onSelect = useCallback(
    (term: string, sentence: string) => setSelected({ term, sentence }),
    []
  )

  const close = useCallback(() => setSelected(null), [])

  return { selected, onSelect, close, persona, mark, refreshMarks }
}
