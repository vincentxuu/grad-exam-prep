import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { ImItConceptCard, ImItLesson, ImItSource } from '@/lib/im-it-learning'

interface Props {
  lesson: ImItLesson
  cards: ImItConceptCard[]
  sources: ImItSource[]
}

export function ImItLessonContent({ lesson, cards, sources }: Props) {
  const [firstQuestion, secondQuestion] = lesson.pastPaperRefs
  const practiceHref = secondQuestion
    ? `/im/questions/${firstQuestion}?mode=drill&next=${secondQuestion}`
    : `/im/questions/${firstQuestion}?mode=drill`

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">內容已複查</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">
            約 {lesson.estimatedMinutes} 分鐘 · {cards.length} 張概念卡 ·{' '}
            {lesson.pastPaperRefs.length} 題對應考古題
          </span>
        </div>
        <h1 className="text-balance text-2xl font-bold">{lesson.title}</h1>
        <p className="text-pretty text-muted-foreground">{lesson.summary}</p>
        <p className="text-pretty text-xs text-muted-foreground">
          本頁為依教材與考古題整理的原創摘要；考古題答案經技術覆核，但不是官方答案。
        </p>
      </header>

      <section className="rounded-lg border bg-muted/30 p-4">
        <h2 className="text-balance text-lg font-semibold">完成後你會</h2>
        <ul className="mt-3 space-y-2">
          {lesson.learningObjectives.map((objective) => (
            <li key={objective} className="flex gap-2 text-pretty text-sm">
              <span aria-hidden="true" className="text-primary">
                ✓
              </span>
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-6">
        {lesson.sections.map((section, index) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-balance text-lg font-semibold">
              <span className="mr-2 tabular-nums text-muted-foreground">{index + 1}.</span>
              {section.title}
            </h2>
            <p className="text-pretty text-sm leading-7 text-muted-foreground">{section.body}</p>
            <ul className="space-y-2 rounded-lg border p-4">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-pretty text-sm leading-6">
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-balance text-lg font-semibold">帶你解題</h2>
        <div className="space-y-3">
          {lesson.workedExamples.map((example, index) => (
            <div key={example.prompt} className="rounded-lg border p-4">
              <p className="text-pretty font-medium">
                範例 <span className="tabular-nums">{index + 1}</span>：{example.prompt}
              </p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                {example.steps.map((step) => (
                  <li key={step} className="text-pretty pl-1">
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-pretty text-sm">
                <span className="font-medium">答案：</span>
                {example.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-balance text-lg font-semibold">常見陷阱</h2>
        <ul className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          {lesson.commonPitfalls.map((pitfall) => (
            <li key={pitfall} className="flex gap-2 text-pretty text-sm leading-6">
              <span aria-hidden="true">⚠</span>
              {pitfall}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-balance text-lg font-semibold">概念卡自我檢查</h2>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            先在心中作答，再展開答案。這些卡片不會混入舊版非英文閃卡排程。
          </p>
        </div>
        <div className="space-y-2">
          {cards.map((card, index) => (
            <details key={card.id} className="group rounded-lg border bg-card">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <span className="tabular-nums text-xs text-muted-foreground">{index + 1}</span>
                <span className="flex-1 text-pretty text-sm font-medium">{card.front}</span>
                <span aria-hidden="true" className="text-muted-foreground group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="space-y-2 border-t px-4 py-3 text-sm">
                <p className="text-pretty font-medium">{card.back}</p>
                <p className="text-pretty leading-6 text-muted-foreground">{card.explanation}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-balance text-lg font-semibold">接著用考古題驗證</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          本課連結的題目都已通過可重現的技術覆核，可逐題練習與判分。
        </p>
        <Link
          href={practiceHref}
          className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          開始本課考古題練習
        </Link>
      </section>

      <section className="space-y-2">
        <h2 className="text-balance text-lg font-semibold">參考來源</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {source.title}
              </a>{' '}
              — {source.author}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
