import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GuideBlockView } from '@/components/guide/guide-block'
import { Badge } from '@/components/ui/badge'
import { EXAM_LABELS, getGuide, guides } from '@/lib/content'

interface Props {
  params: Promise<{ guideId: string }>
}

export function generateStaticParams() {
  return guides.map((g) => ({ guideId: g.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guideId } = await params
  const guide = getGuide(guideId)
  return {
    title: guide ? `${guide.title} | 台大研所備考` : '找不到頁面',
    description: guide?.summary,
  }
}

export default async function GuidePage({ params }: Props) {
  const { guideId } = await params
  const guide = getGuide(guideId)
  if (!guide) notFound()

  const primaryExam = guide.examRelevance[0] ?? 'im'

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/guides" className="hover:text-foreground">
          上榜心得
        </Link>
        <span>/</span>
        <span className="text-foreground">{guide.year ? `${guide.year} 學年度` : '心得整理'}</span>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {guide.examRelevance.map((e) => (
            <Badge key={e} variant="outline" className="text-xs">
              {EXAM_LABELS[e]}
            </Badge>
          ))}
          {guide.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold leading-snug">{guide.title}</h1>
        {guide.subtitle && <p className="text-muted-foreground">{guide.subtitle}</p>}
        <p className="text-sm leading-7">{guide.summary}</p>
      </header>

      {/* Source attribution */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">出處</span>
          <span className="text-muted-foreground">
            {guide.source.platform}
            {guide.source.author ? ` · ${guide.source.author}` : ''}
          </span>
          <a
            href={guide.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            閱讀原文 →
          </a>
        </div>
        {guide.source.note && <p className="text-xs text-muted-foreground">{guide.source.note}</p>}
      </div>

      {/* Key takeaways */}
      <section className="rounded-lg border p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-1.5">
          <span>⭐</span>
          <span>五個重點</span>
        </h2>
        <ol className="space-y-2">
          {guide.takeaways.map((item, i) => (
            <li key={item} className="flex gap-3 text-sm leading-6">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Time allocation */}
      {guide.timeAllocation && (
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-1.5">
            <span>⏱️</span>
            <span>建議時間分配</span>
          </h2>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {guide.timeAllocation.items.map((item, i) => (
              <div
                key={item.label}
                className={i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary/60' : 'bg-primary/30'}
                style={{ width: `${item.pct}%` }}
                title={`${item.label} ${item.pct}%`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {guide.timeAllocation.items.map((item) => (
              <div key={item.label} className="flex gap-3 text-sm">
                <span className="w-28 shrink-0 font-medium">{item.label}</span>
                <span className="w-10 shrink-0 tabular-nums text-primary font-semibold">
                  {item.pct}%
                </span>
                <span className="text-muted-foreground text-xs leading-6">{item.hint}</span>
              </div>
            ))}
          </div>
          {guide.timeAllocation.note && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              ※ {guide.timeAllocation.note}
            </p>
          )}
        </section>
      )}

      {/* Table of contents */}
      <nav className="rounded-lg border p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">本文大綱</p>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {guide.sections.map((section, i) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-primary hover:underline">
                {i + 1}. {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sections */}
      {guide.sections.map((section) => (
        <section key={section.id} id={section.id} className="space-y-4 scroll-mt-20">
          <div className="space-y-1 border-b pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {section.icon && <span>{section.icon}</span>}
              <span>{section.title}</span>
            </h2>
            {section.intro && (
              <p className="text-sm text-muted-foreground leading-6">{section.intro}</p>
            )}
          </div>
          <div className="space-y-4">
            {section.blocks.map((block, i) => (
              <GuideBlockView
                key={`${section.id}-${block.type}-${i}`}
                block={block}
                examId={primaryExam}
              />
            ))}
          </div>
        </section>
      ))}

      <footer className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
        <p>本頁為原文的重點整理與延伸註解，非原文轉載；引用僅限必要片段，著作權屬原作者所有。</p>
        <p>考科組合、報名人數、錄取名額等資訊每年皆可能異動，請以各校最新招生簡章為準。</p>
      </footer>
    </div>
  )
}
