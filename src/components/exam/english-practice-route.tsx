import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  MessagesSquare,
  RotateCcw,
  TimerReset,
} from 'lucide-react'
import Link from 'next/link'

const DAILY_STEPS = [
  {
    order: '01',
    measure: '15 分',
    title: '先把單字叫得回來',
    description: '從「必背、重要」開始，每輪最多 50 張；聽發音、回想，再誠實評分。',
    href: '/im/flashcards?subject=im-english',
    action: '開始單字複習',
    icon: Brain,
  },
  {
    order: '02',
    measure: '1 篇',
    title: '把字放回文章裡',
    description: '每天完成一篇主題閱讀；先作答，再回文章找支持答案的句子。',
    href: '/im/reading-practice',
    action: '選一篇文章',
    icon: BookOpenCheck,
  },
  {
    order: '03',
    measure: '20 題',
    title: '用真題校正判斷',
    description: '依年份練英文(B)，不要只記答案；答錯的題目會留在錯題本。',
    href: '/im/questions?subject=im-english',
    action: '進入英文題庫',
    icon: RotateCcw,
  },
] as const

export function EnglishPracticeRoute() {
  return (
    <section
      aria-labelledby="english-practice-title"
      className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-background"
    >
      <div className="border-b border-primary/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              English training route
            </p>
            <h2 id="english-practice-title" className="mt-1 text-xl font-bold tracking-tight">
              今天的英文，照這條路線練
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              單字喚回 → 閱讀理解 → 歷屆真題。每天完成基本盤，再把錯誤帶進下一輪。
            </p>
          </div>
          <span className="w-fit rounded-full border border-primary/20 bg-background/80 px-3 py-1 font-mono text-xs font-medium text-primary">
            每日 3 段
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
          href="/im/chat"
          className="group flex items-start gap-3 border-b p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-r sm:border-b-0"
        >
          <MessagesSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              有餘力：對話 10 分鐘
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              開啟糾錯模式，把收藏的單字用進自己的句子。
            </span>
          </span>
        </Link>
        <Link
          href="/im/mock?subject=im-english"
          className="group flex items-start gap-3 p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <TimerReset
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              每週：完整模擬 1–2 回
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              計時完成一個年度，再到錯題本重練到真正會。
            </span>
          </span>
        </Link>
      </div>
    </section>
  )
}
