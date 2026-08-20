'use client'

import { useMemo, useState } from 'react'
import { layoutWordWeb, type WordWebGroup, type WordWebNode } from '@/lib/word-web-layout'

export interface VocabMindMapProps {
  word: string
  chinese: string
  synonyms?: string[]
  antonyms?: string[]
  relatedWords?: string[]
  confusableWith?: string[]
  exampleSentences?: Array<{ en: string; zh: string }>
  semanticGroup?: string
  mnemonicHint?: string
  onWordClick?: (word: string) => void
}

interface GroupDef {
  key: string
  label: string
  hint: string
  color: string
  pick: (props: VocabMindMapProps) => string[] | undefined
}

const GROUP_DEFS: GroupDef[] = [
  {
    key: 'synonym',
    label: '同義',
    hint: '意思相近',
    color: 'hsl(var(--word-web-synonym))',
    pick: (p) => p.synonyms,
  },
  {
    key: 'related',
    label: '相關',
    hint: '同源／衍生',
    color: 'hsl(var(--word-web-related))',
    pick: (p) => p.relatedWords,
  },
  {
    key: 'antonym',
    label: '反義',
    hint: '意思相反',
    color: 'hsl(var(--word-web-antonym))',
    pick: (p) => p.antonyms,
  },
  {
    key: 'confusable',
    label: '易混',
    hint: '拼字易混淆',
    color: 'hsl(var(--word-web-confusable))',
    pick: (p) => p.confusableWith,
  },
]

type ViewMode = 'auto' | 'map' | 'list'

function dedupe(words: string[], taken: Set<string>): string[] {
  const out: string[] = []
  for (const word of words) {
    const key = word.toLowerCase()
    if (taken.has(key)) continue
    taken.add(key)
    out.push(word)
  }
  return out
}

function buildGroups(
  props: VocabMindMapProps
): Array<WordWebGroup & { color: string; hint: string }> {
  const taken = new Set<string>([props.word.toLowerCase()])
  const groups: Array<WordWebGroup & { color: string; hint: string }> = []
  for (const def of GROUP_DEFS) {
    const words = dedupe(def.pick(props) ?? [], taken)
    if (words.length === 0) continue
    groups.push({ key: def.key, label: def.label, words, color: def.color, hint: def.hint })
  }
  return groups
}

function WordNode({
  node,
  color,
  active,
  dimmed,
  onActivate,
  onFocusChange,
}: {
  node: WordWebNode
  color: string
  active: boolean
  dimmed: boolean
  onActivate?: (word: string) => void
  onFocusChange: (word: string | null) => void
}) {
  return (
    <g
      className="cursor-pointer transition-opacity duration-150 focus:outline-none motion-reduce:transition-none"
      opacity={dimmed ? 0.28 : 1}
      role="button"
      tabIndex={0}
      aria-label={`${node.groupLabel}：${node.word}`}
      onMouseEnter={() => onFocusChange(node.word)}
      onMouseLeave={() => onFocusChange(null)}
      onFocus={() => onFocusChange(node.word)}
      onBlur={() => onFocusChange(null)}
      onClick={() => onActivate?.(node.word)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate?.(node.word)
        }
      }}
    >
      <line
        x1={node.edge.x1}
        y1={node.edge.y1}
        x2={node.edge.x2}
        y2={node.edge.y2}
        stroke={color}
        strokeOpacity={active ? 0.9 : 0.35}
        strokeWidth={active ? 2 : 1.25}
        strokeDasharray={active ? 'none' : '4 4'}
        strokeLinecap="round"
      />
      <rect
        x={node.x - node.width / 2}
        y={node.y - node.height / 2}
        width={node.width}
        height={node.height}
        rx={node.height / 2}
        fill={active ? color : 'hsl(var(--card))'}
        stroke={color}
        strokeWidth={active ? 2 : 1.25}
        className="transition-[fill,stroke-width] duration-150 motion-reduce:transition-none"
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={active ? 'hsl(var(--card))' : 'hsl(var(--foreground))'}
        fontSize={12}
        fontWeight={600}
        fontFamily="var(--font-inter), system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {node.word}
      </text>
    </g>
  )
}

export function VocabMindMap(props: VocabMindMapProps) {
  const [active, setActive] = useState<string | null>(null)
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([])
  const [view, setView] = useState<ViewMode>('auto')

  const groups = useMemo(() => buildGroups(props), [props])
  const visibleGroups = groups.filter((g) => !hiddenGroups.includes(g.key))
  const colorOf = useMemo(() => new Map(groups.map((g) => [g.key, g.color] as const)), [groups])

  const layout = useMemo(
    () =>
      layoutWordWeb(
        props.word,
        props.chinese,
        visibleGroups.map((g) => ({ key: g.key, label: g.label, words: g.words }))
      ),
    [props.word, props.chinese, groups, hiddenGroups]
  )

  const hasGroups = groups.length > 0
  const hasExtra =
    (props.exampleSentences?.length ?? 0) > 0 || props.semanticGroup || props.mnemonicHint

  if (!hasGroups && !hasExtra) return null

  function toggleGroup(key: string) {
    setActive(null)
    setHiddenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const mapVisibility = view === 'map' ? 'block' : view === 'list' ? 'hidden' : 'hidden sm:block'
  const listVisibility = view === 'list' ? 'block' : view === 'map' ? 'hidden' : 'sm:hidden'

  return (
    <div className="space-y-3">
      {hasGroups && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Word Web
            </span>

            {groups.map((g) => {
              const off = hiddenGroups.includes(g.key)
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleGroup(g.key)}
                  aria-pressed={!off}
                  title={`${g.hint}（點擊${off ? '顯示' : '隱藏'}）`}
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
                  style={{
                    borderColor: off ? 'hsl(var(--border))' : g.color,
                    backgroundColor: off
                      ? 'transparent'
                      : `color-mix(in srgb, ${g.color} 14%, transparent)`,
                    color: off ? 'hsl(var(--muted-foreground))' : g.color,
                  }}
                >
                  {g.label} {g.words.length}
                </button>
              )
            })}

            <div className="ml-auto flex items-center gap-1">
              {(
                [
                  ['map', '圖譜'],
                  ['list', '清單'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView((prev) => (prev === mode ? 'auto' : mode))}
                  aria-pressed={view === mode}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    view === mode
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {layout ? (
            <>
              <div className={mapVisibility} role="group" aria-label={`${props.word} 的語義網絡`}>
                <svg
                  viewBox={layout.viewBox}
                  preserveAspectRatio="xMidYMid meet"
                  className="mx-auto block w-full max-w-lg"
                  style={{
                    // Never upscale past the intrinsic size — a two-word web should
                    // stay small instead of stretching the label text.
                    maxWidth: layout.width,
                    aspectRatio: `${layout.width} / ${layout.height}`,
                  }}
                >
                  <title>{`${props.word} 的語義網絡`}</title>
                  {layout.nodes.map((node) => (
                    <WordNode
                      key={`${node.groupKey}-${node.word}`}
                      node={node}
                      color={colorOf.get(node.groupKey) ?? 'hsl(var(--primary))'}
                      active={active === node.word}
                      dimmed={active !== null && active !== node.word}
                      onActivate={props.onWordClick}
                      onFocusChange={setActive}
                    />
                  ))}

                  <g
                    className={props.onWordClick ? 'cursor-pointer' : undefined}
                    onClick={() => props.onWordClick?.(props.word)}
                    role={props.onWordClick ? 'button' : undefined}
                    aria-label={props.onWordClick ? `播放 ${props.word}` : undefined}
                  >
                    <ellipse
                      cx={layout.hub.x}
                      cy={layout.hub.y}
                      rx={layout.hub.rx}
                      ry={layout.hub.ry}
                      fill="hsl(var(--primary))"
                      opacity={0.1}
                    />
                    <ellipse
                      cx={layout.hub.x}
                      cy={layout.hub.y}
                      rx={layout.hub.rx}
                      ry={layout.hub.ry}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <text
                      x={layout.hub.x}
                      y={layout.hub.y - 7}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="hsl(var(--primary))"
                      fontSize={16}
                      fontWeight={700}
                      fontFamily="var(--font-sora), var(--font-inter), system-ui, sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {props.word}
                    </text>
                    <text
                      x={layout.hub.x}
                      y={layout.hub.y + 13}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={11}
                      style={{ pointerEvents: 'none' }}
                    >
                      {props.chinese}
                    </text>
                  </g>
                </svg>
              </div>

              <div className={`${listVisibility} space-y-2 px-3 py-3`}>
                {visibleGroups.map((g) => (
                  <div key={g.key} className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="min-w-[2.5rem] text-[11px] font-medium"
                      style={{ color: g.color }}
                    >
                      {g.label}
                    </span>
                    {g.words.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => props.onWordClick?.(w)}
                        className="rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{ borderColor: g.color }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              已隱藏所有關聯詞，點上方標籤可重新顯示。
            </p>
          )}
        </div>
      )}

      {hasExtra && (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          {props.semanticGroup && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">語義群：</span>
              {props.semanticGroup}
            </p>
          )}

          {props.mnemonicHint && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">記憶提示：</span>
              {props.mnemonicHint}
            </p>
          )}

          {props.exampleSentences && props.exampleSentences.length > 0 && (
            <div className="space-y-1.5 border-t pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                情境例句
              </p>
              {props.exampleSentences.map((s, i) => (
                <div key={i} className="text-xs leading-relaxed">
                  <p className="text-foreground/90 italic">{s.en}</p>
                  <p className="text-muted-foreground">{s.zh}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
