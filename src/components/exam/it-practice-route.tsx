import {
  ArrowRight,
  BookOpen,
  CircleCheckBig,
  Layers,
  ListChecks,
  TimerReset,
} from '@sketchyicons/react'
import Link from 'next/link'

const DAILY_STEPS = [
  {
    order: '01',
    measure: '30 分',
    title: '讀一堂主題課',
    description: '每天一堂，從 AI 或資料結構開始；讀完公式、機制和範例，抓住考點。',
    href: '/im/subjects/im-it',
    action: '選一堂課',
    icon: BookOpen,
  },
  {
    order: '02',
    measure: '10 分',
    title: '翻概念卡強化',
    description: '用 flashcard 複習剛學的概念，先用自己的話說，再翻面對答案。',
    href: '/im/flashcards?subject=im-it',
    action: '開始概念卡',
    icon: Layers,
  },
  {
    order: '03',
    measure: '20 分',
    title: '刷考古題驗證',
    description: '依主題練選擇題，答錯的回去看課程；不要只記答案，理解為什麼錯。',
    href: '/im/questions?subject=im-it',
    action: '進入計概題庫',
    icon: CircleCheckBig,
  },
] as const

export function ItPracticeRoute() {
  return (
    <section
      aria-labelledby="it-practice-title"
      className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-background"
    >
      <div className="border-b border-primary/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              IT study route
            </p>
            <h2 id="it-practice-title" className="mt-1 text-xl font-bold font-display tracking-tight">
              計概每天三步，選擇題拿穩
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              主題課 → 概念卡 → 考古題。每天完成一輪，一個月覆蓋全部主題。
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
          href="/im/mock?subject=im-it"
          className="group flex items-start gap-3 border-b p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-r sm:border-b-0"
        >
          <TimerReset className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              有餘力：模擬考
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              計時完成一個年度的選擇題，體感真實考試節奏。
            </span>
          </span>
        </Link>
        <Link
          href="/im/review"
          className="group flex items-start gap-3 p-4 transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ListChecks
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-medium group-hover:text-primary">
              每週：錯題回顧
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              回顧本週答錯的題目，確認是粗心還是觀念不清。
            </span>
          </span>
        </Link>
      </div>
    </section>
  )
}
