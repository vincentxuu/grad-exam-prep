'use client'

import { useState } from 'react'

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

interface NodeGroup {
  label: string
  words: string[]
  color: string
  lineColor: string
  startAngle: number
}

const SVG_W = 500
const SVG_H = 380
const CX = SVG_W / 2
const CY = SVG_H / 2
const RADIUS = 140

function buildGroups(props: VocabMindMapProps): NodeGroup[] {
  const groups: NodeGroup[] = []
  if (props.synonyms?.length)
    groups.push({
      label: '同義',
      words: props.synonyms,
      color: 'hsl(207 26% 48%)',
      lineColor: 'hsl(207 26% 48% / 0.3)',
      startAngle: -90,
    })
  if (props.relatedWords?.length)
    groups.push({
      label: '相關',
      words: props.relatedWords,
      color: 'hsl(207 26% 64%)',
      lineColor: 'hsl(207 26% 64% / 0.3)',
      startAngle: 0,
    })
  if (props.antonyms?.length)
    groups.push({
      label: '反義',
      words: props.antonyms,
      color: 'hsl(0 50% 58%)',
      lineColor: 'hsl(0 50% 58% / 0.3)',
      startAngle: 90,
    })
  if (props.confusableWith?.length)
    groups.push({
      label: '易混',
      words: props.confusableWith,
      color: 'hsl(38 80% 50%)',
      lineColor: 'hsl(38 80% 50% / 0.3)',
      startAngle: 180,
    })
  return groups
}

interface PlacedNode {
  word: string
  x: number
  y: number
  color: string
  lineColor: string
  groupLabel: string
}

function placeNodes(groups: NodeGroup[]): PlacedNode[] {
  if (groups.length === 0) return []

  const totalWords = groups.reduce((s, g) => s + g.words.length, 0)
  if (totalWords === 0) return []

  const nodes: PlacedNode[] = []
  const slicePerWord = 360 / totalWords
  let currentAngle = -90

  for (const group of groups) {
    for (const word of group.words) {
      const rad = (currentAngle * Math.PI) / 180
      const jitter = totalWords > 6 ? (Math.abs(hashCode(word) % 20) - 10) : 0
      const r = RADIUS + jitter
      nodes.push({
        word,
        x: CX + r * Math.cos(rad),
        y: CY + r * Math.sin(rad),
        color: group.color,
        lineColor: group.lineColor,
        groupLabel: group.label,
      })
      currentAngle += slicePerWord
    }
  }

  return nodes
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h
}

function WordNode({
  node,
  hovering,
  onHover,
  onClick,
}: {
  node: PlacedNode
  hovering: boolean
  onHover: (word: string | null) => void
  onClick?: (word: string) => void
}) {
  const textLen = node.word.length
  const pillW = Math.max(textLen * 8 + 24, 60)
  const pillH = 28

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(node.word)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(node.word)}
      role="button"
      tabIndex={0}
      aria-label={`${node.groupLabel}：${node.word}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(node.word)
      }}
    >
      <line
        x1={CX}
        y1={CY}
        x2={node.x}
        y2={node.y}
        stroke={hovering ? node.color : node.lineColor}
        strokeWidth={hovering ? 2 : 1.5}
        strokeDasharray={hovering ? 'none' : '4 3'}
      />
      <rect
        x={node.x - pillW / 2}
        y={node.y - pillH / 2}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill={hovering ? node.color : 'hsl(var(--card))'}
        stroke={node.color}
        strokeWidth={hovering ? 2 : 1}
        style={{ transition: 'fill 0.15s, stroke-width 0.15s' }}
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={hovering ? 'white' : node.color}
        fontSize={12}
        fontWeight={500}
        fontFamily="var(--font-inter), system-ui, sans-serif"
        style={{ transition: 'fill 0.15s', pointerEvents: 'none' }}
      >
        {node.word}
      </text>
    </g>
  )
}

export function VocabMindMap(props: VocabMindMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const groups = buildGroups(props)
  const nodes = placeNodes(groups)
  const hasNodes = nodes.length > 0
  const hasExtra =
    (props.exampleSentences?.length ?? 0) > 0 || props.semanticGroup || props.mnemonicHint

  if (!hasNodes && !hasExtra) return null

  return (
    <div className="space-y-3">
      {hasNodes && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Word Web
            </span>
            {groups.map((g) => (
              <span
                key={g.label}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${g.color}20`, color: g.color }}
              >
                {g.label}
              </span>
            ))}
          </div>

          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="mx-auto block w-full max-w-md"
            role="img"
            aria-label={`${props.word} 的語義網絡`}
          >
            {nodes.map((n) => (
              <WordNode
                key={n.word}
                node={n}
                hovering={hovered === n.word}
                onHover={setHovered}
                onClick={props.onWordClick}
              />
            ))}

            <circle cx={CX} cy={CY} r={36} fill="hsl(var(--primary))" opacity={0.12} />
            <circle cx={CX} cy={CY} r={36} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
            <text
              x={CX}
              y={CY - 6}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(var(--primary))"
              fontSize={16}
              fontWeight={700}
              fontFamily="var(--font-sora), var(--font-inter), system-ui, sans-serif"
            >
              {props.word}
            </text>
            <text
              x={CX}
              y={CY + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(var(--muted-foreground))"
              fontSize={11}
            >
              {props.chinese}
            </text>
          </svg>
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
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
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
