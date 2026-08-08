import Link from 'next/link'
import { CopyButton } from '@/components/guide/copy-button'
import { Badge } from '@/components/ui/badge'
import { getSubject } from '@/lib/content'
import type { CalloutVariant, CompareTone, ExamId, GuideBlock } from '@/types/content'

const COMPARE_TONES: Record<
  CompareTone,
  { wrapper: string; heading: string; icon: string; marker: string }
> = {
  pro: {
    wrapper: 'bg-emerald-500/5',
    heading: 'text-emerald-700 dark:text-emerald-400',
    icon: '👍',
    marker: '✓',
  },
  con: {
    wrapper: 'bg-rose-500/5',
    heading: 'text-rose-700 dark:text-rose-400',
    icon: '👎',
    marker: '✕',
  },
  neutral: {
    wrapper: 'bg-muted/30',
    heading: 'text-foreground',
    icon: '',
    marker: '•',
  },
}

const CALLOUT_STYLES: Record<CalloutVariant, { wrapper: string; icon: string; label: string }> = {
  tip: {
    wrapper: 'border-l-4 border-l-emerald-500 bg-emerald-500/5',
    icon: '💡',
    label: '實作建議',
  },
  warn: {
    wrapper: 'border-l-4 border-l-amber-500 bg-amber-500/5',
    icon: '⚠️',
    label: '注意',
  },
  insight: {
    wrapper: 'border-l-4 border-l-primary bg-primary/5',
    icon: '🔑',
    label: '關鍵洞察',
  },
}

export function GuideBlockView({ block, examId }: { block: GuideBlock; examId: ExamId }) {
  switch (block.type) {
    case 'prose':
      return <p className="text-sm leading-7 text-muted-foreground">{block.text}</p>

    case 'list':
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-semibold">{block.title}</h3>}
          <ul className="space-y-1.5">
            {block.items?.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                <span className="text-primary shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'callout': {
      const style = CALLOUT_STYLES[block.variant ?? 'tip']
      return (
        <div className={`rounded-lg border p-4 space-y-1.5 ${style.wrapper}`}>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span>{style.icon}</span>
            <span>{block.title ?? style.label}</span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{block.text}</p>
        </div>
      )
    }

    case 'compare':
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-semibold">{block.title}</h3>}
          <div className="grid md:grid-cols-2 gap-3">
            {block.columns?.map((col) => {
              const tone = COMPARE_TONES[col.tone]
              const icon = col.icon ?? tone.icon
              return (
                <div key={col.title} className={`rounded-lg border p-4 space-y-2 ${tone.wrapper}`}>
                  <h4 className={`text-sm font-semibold ${tone.heading}`}>
                    {icon ? `${icon} ` : ''}
                    {col.title}
                  </h4>
                  <ul className="space-y-1.5">
                    {col.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                        <span className="shrink-0">{tone.marker}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )

    case 'table':
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-semibold">{block.title}</h3>}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  {block.headers?.map((h) => (
                    <th key={h} className="text-left p-3 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows?.map((row, i) => (
                  <tr key={row.join('|')} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    {row.map((cell, j) => (
                      <td
                        key={`${cell}-${j}`}
                        className={j === 0 ? 'p-3 font-medium' : 'p-3 text-muted-foreground'}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <p className="text-xs text-muted-foreground">※ {block.note}</p>}
        </div>
      )

    case 'prompt':
      return (
        <div className="rounded-lg border bg-muted/30 overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 py-2.5 border-b bg-muted/40">
            <div>
              <h3 className="text-sm font-semibold">🤖 {block.title}</h3>
              {block.text && <p className="text-xs text-muted-foreground mt-0.5">{block.text}</p>}
            </div>
            <CopyButton text={block.prompt ?? ''} label="複製 prompt" />
          </div>
          <pre className="p-4 text-xs leading-6 whitespace-pre-wrap font-mono text-muted-foreground">
            {block.prompt}
          </pre>
        </div>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-l-primary/40 pl-4 py-1 space-y-1">
          <p className="text-sm leading-7 italic">「{block.text}」</p>
          {block.cite && <footer className="text-xs text-muted-foreground">— {block.cite}</footer>}
        </blockquote>
      )

    case 'subject': {
      const subject = block.subjectId ? getSubject(block.subjectId) : undefined
      return (
        <div className="rounded-lg border p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="text-base font-semibold">{block.title}</h3>
            {subject && (
              <Link href={`/${examId}/subjects/${subject.id}`}>
                <Badge variant="outline" className="text-xs hover:bg-accent">
                  主題樹：{subject.name.split('（')[0]} →
                </Badge>
              </Link>
            )}
          </div>
          {block.weightHint && (
            <p className="text-xs text-muted-foreground border-l-2 border-l-primary/40 pl-2">
              {block.weightHint}
            </p>
          )}
          <ul className="space-y-1.5">
            {block.items?.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                <span className="text-primary shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    case 'links':
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-semibold">{block.title}</h3>}
          <div className="grid sm:grid-cols-2 gap-2">
            {block.links?.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium">{link.label} →</div>
                {link.desc && (
                  <div className="text-xs text-muted-foreground mt-0.5">{link.desc}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
