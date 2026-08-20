'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWordWeb, type WordWebEntry } from '@/hooks/use-word-web'
import { VocabMindMap } from './vocab-mind-map'

interface WordWebPanelProps {
  /** The headword the panel starts from. */
  word: string
  /** Prefix for speech ids so several panels can coexist on a page. */
  idPrefix?: string
  speak?: (text: string, id?: string) => void
}

/**
 * Word Web with in-place exploration: expanding a related word re-centres the
 * map on it and pushes a breadcrumb, so a learner can walk the vocabulary graph
 * without leaving the card.
 */
export function WordWebPanel({ word, idPrefix = 'word-web', speak }: WordWebPanelProps) {
  const [trail, setTrail] = useState<string[]>([])
  const focus = trail.length > 0 ? trail[trail.length - 1] : word
  const { entry, hasWord, getGroup, getGloss } = useWordWeb(focus)
  const [shown, setShown] = useState<WordWebEntry | null>(entry)

  useEffect(() => {
    setTrail([])
  }, [word])

  // Keep the previous map on screen while the next shard loads, so expanding
  // never blinks the panel away.
  useEffect(() => {
    if (entry) setShown(entry)
  }, [entry])

  const expand = useCallback(
    (next: string) => {
      setTrail((prev) => {
        const path = [word, ...prev]
        const seen = path.findIndex((w) => w.toLowerCase() === next.toLowerCase())
        return seen >= 0 ? path.slice(1, seen + 1) : [...prev, next]
      })
    },
    [word]
  )

  if (!shown) return null

  const group = getGroup(shown.semanticGroup)
  const path = [word, ...trail]

  return (
    <div className="space-y-2">
      {trail.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {path.map((w, i) => (
            <span key={w} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">›</span>}
              <button
                type="button"
                onClick={() => setTrail(path.slice(1, i))}
                className={
                  i === path.length - 1
                    ? 'font-medium text-foreground'
                    : 'underline underline-offset-2 hover:text-foreground'
                }
                aria-current={i === path.length - 1 ? 'page' : undefined}
              >
                {w}
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setTrail((prev) => prev.slice(0, -1))}
            className="ml-auto rounded-md px-2 py-0.5 hover:bg-muted"
          >
            ← 返回
          </button>
        </div>
      )}

      <VocabMindMap
        word={shown.word}
        chinese={shown.chinese}
        pos={shown.pos}
        synonyms={shown.synonyms}
        antonyms={shown.antonyms}
        relatedWords={shown.relatedWords}
        confusableWith={shown.confusableWith}
        exampleSentences={shown.exampleSentences}
        semanticGroup={shown.semanticGroup}
        semanticGroupLabel={group?.label}
        semanticGroupWords={group?.words}
        mnemonicHint={shown.mnemonicHint}
        onWordClick={speak ? (clicked) => speak(clicked, `${idPrefix}-${clicked}`) : undefined}
        getGloss={getGloss}
        canExpand={hasWord}
        onExpand={expand}
      />
    </div>
  )
}
