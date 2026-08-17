import {
  ArrowRight,
  BookOpen,
  Layers,
  Newspaper,
  PenLine,
  RefreshCcw,
} from 'lucide-react'
import Link from 'next/link'

const DAILY_STEPS = [
  {
    order: '01',
    measure: '40 分',
    title: '深讀一堂課',
    description: '理解框架和案例，準備申論答題骨架；重點是能用自己的話重述理論。',
    href: '/im/subjects/im-mis',
    action: '選一堂課',
    icon: BookOpen,
  },
  {
    order: '02',
    measure: '10 分',
    title: '概念卡自測',
    description: '用自己的話說出定義和機制，再翻面確認；說不出來的回去重讀。',
    href: '/im/flashcards?subject=im-mis',
    action: '開始概念卡',
    icon: Layers,
  },
  {
    order: '03',
    measure: '30 分',
    title: '申論自評',
    description: '寫完整申論，用 rubric 逐項自評；重點是因果鏈完整，不是堆名詞。',
    href: '/im/questions?subject=im-mis',
    action: '進入 MIS 題庫',
    icon: PenLine,
  },
] as const

export function MisPracticeRoute() {
  return (
    <section
      aria-labelledby="mis-practice-title"
      className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-background"
    >
      <div className="border-b border-primary/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              MIS study route
            </p>
            <h2 id="mis-practice-title" className="mt-1 text-xl font-bold tracking-tight">
              MIS 的申論，靠框架和案例
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              讀理論 → 自測概念 → 寫申論自評。每天一主題，學會用框架串起案例。
            </p>
          </div>
          <span className="w-fit rounded-full border border-primary/20 bg-background/80 px-3 py-1 font-mono text-xs font-medium text-primary">
            每日 1.5 小時
          </span>
        </div>
      </div>

      <ol className="grid md:grid-cols-3">
        {DAILY_STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <li
              key={step.order}
              className={`relative p-4 sm:p-5 ${index < DAILY_STEPS.length - 1 ? 'border-b md:border-r md:border-b-0' : ''}`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{step.order}</span>
                  <span className="h-px w-7 bg-primary/30" aria-hidden="true" />
                  <span className="font-mono text-xs text-muted-foreground">{step.measure}</span>
                </div>
                <span className="rounded-md bg-primary/10 p-2 text-primary" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 min-h-16 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {step.action}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="grid border-t bg-muted/25 sm:grid-cols-2">
        <div className="flex items-start gap-3 border-b p-4 sm:border-r sm:border-b-0">
          <Newspaper
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-medium">有餘力：時事案例</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              讀 CNN／BBC 科技新聞累積案例，申論舉例用得到。
            </span>
          </span>
        </div>
        <Link
          href="/im/subjects/im-mis"
          className="group flex items-start gap-3 p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <RefreshCcw
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              每週：框架串聯
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              跨主題整合，例如用 IT 策略 + 資料治理 + 平台效應回答一題。
            </span>
          </span>
        </Link>
      </div>
    </section>
  )
}
