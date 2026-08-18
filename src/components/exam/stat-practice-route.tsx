import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Info,
  Layers,
} from '@sketchyicons/react'
import Link from 'next/link'

const DAILY_STEPS = [
  {
    order: '01',
    measure: '30 分',
    title: '學公式和範例',
    description: '每堂課都有帶數字的計算步驟，跟著做一遍；重點是理解公式在說什麼。',
    href: '/im/subjects/im-stat',
    action: '選一堂課',
    icon: BookOpen,
  },
  {
    order: '02',
    measure: '20 分',
    title: '練教材題',
    description: '用 OpenIntro 練習題強化計算，從機率、估計到迴歸都有；錯了回去看公式。',
    href: '/im/questions?subject=im-stat',
    action: '開始練題',
    icon: Calculator,
  },
  {
    order: '03',
    measure: '15 分',
    title: '挑戰考古題',
    description: '114–115 年申論題自評；題目少但含金量高，每題都值得寫完整解題過程。',
    href: '/im/questions?subject=im-stat&source=ntu-im',
    action: '進入統計考古題',
    icon: ClipboardCheck,
  },
] as const

export function StatPracticeRoute() {
  return (
    <section
      aria-labelledby="stat-practice-title"
      className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-background"
    >
      <div className="border-b border-primary/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              Stat study route
            </p>
            <h2 id="stat-practice-title" className="mt-1 text-xl font-bold font-display tracking-tight">
              統計新考科，公式 × 練題雙軌
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              學公式 → 教材題 → 考古題。統計 114 年才開考，教材練習是補題量的關鍵。
            </p>
          </div>
          <span className="w-fit rounded-full border border-primary/20 bg-background/80 px-3 py-1 font-mono text-xs font-medium text-primary">
            每日 1 小時
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
        <Link
          href="/im/flashcards?subject=im-stat"
          className="group flex items-start gap-3 border-b p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-r sm:border-b-0"
        >
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              重點：公式卡片
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              每天翻一遍公式卡，E[X]、Var、CI、卡方公式要能秒寫。
            </span>
          </span>
        </Link>
        <div className="flex items-start gap-3 p-4">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-medium">注意：114 年才開考</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              考古題只有 5 題，教材練習題（30 題）是補題量的主力。
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
