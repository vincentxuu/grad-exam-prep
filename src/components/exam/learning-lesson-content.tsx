import { ArrowRight, Check, ChevronRight, TriangleAlert } from '@sketchyicons/react'
import Link from 'next/link'
import { InteractiveBlock } from '@/components/exam/interactive-block'
import { LearningBeginnerGlossary } from '@/components/exam/learning-beginner-glossary'
import { Badge } from '@/components/ui/badge'
import type {
  LearningCatalog,
  LearningConceptCard,
  LearningLesson,
  LearningSource,
} from '@/lib/learning'

interface Props {
  catalog: LearningCatalog
  lesson: LearningLesson
  cards: LearningConceptCard[]
  sources: LearningSource[]
}

export function LearningLessonContent({ catalog, lesson, cards, sources }: Props) {
  const copy = catalog.lessonCopy
  const beginnerGlossary = catalog.getBeginnerGlossaryForLesson(lesson.id)
  const practiceHref = catalog.getPracticeHref(lesson)
  const hasDirectPastPaperEvidence = lesson.pastPaperRefs.length > 0
  const practiceTitle = hasDirectPastPaperEvidence
    ? copy.practiceTitle
    : (copy.foundationPracticeTitle ?? copy.practiceTitle)
  const practiceDescription = hasDirectPastPaperEvidence
    ? copy.practiceDescription
    : (copy.foundationPracticeDescription ?? copy.practiceDescription)
  const practiceActionLabel = hasDirectPastPaperEvidence
    ? copy.practiceActionLabel
    : (copy.foundationPracticeActionLabel ?? copy.practiceActionLabel)

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{copy.reviewBadge}</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">
            約 {lesson.estimatedMinutes} 分鐘 · {cards.length} {copy.cardUnit} ·{' '}
            {lesson.pastPaperRefs.length} {copy.pastPaperUnit}
          </span>
        </div>
        <h1 className="text-balance text-2xl font-bold font-display">{lesson.title}</h1>
        <p className="text-pretty text-xs text-muted-foreground">{copy.contentNotice}</p>
        {lesson.evidenceNote ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-pretty text-sm leading-6 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            <span className="font-semibold">考古題證據邊界：</span> {lesson.evidenceNote}
          </p>
        ) : null}
      </header>

      <LearningBeginnerGlossary terms={beginnerGlossary} />

      <section className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-4 text-pretty text-sm leading-6 text-muted-foreground">{lesson.summary}</p>
        <h2 className="text-balance text-lg font-semibold">{copy.objectivesTitle}</h2>
        <ul className="mt-3 space-y-2">
          {lesson.learningObjectives.map((objective) => (
            <li key={objective} className="flex gap-2 text-pretty text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      {lesson.learningScenario ? (
        <section className="space-y-5" aria-labelledby="learning-scenario-title">
          <div className="rounded-xl border-2 border-sky-700 bg-sky-50 p-5 text-slate-950 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-50">
            <p className="text-xs font-semibold tracking-wide text-sky-800 dark:text-sky-200">
              {copy.scenarioEyebrow}
            </p>
            <h2 id="learning-scenario-title" className="mt-2 text-balance text-xl font-semibold">
              {lesson.learningScenario.title}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-7">{lesson.learningScenario.hook}</p>
            <div className="mt-4 border-l-2 border-sky-600 pl-4 dark:border-sky-300">
              <p className="text-xs text-slate-700 dark:text-slate-200">{copy.scenarioPrompt}</p>
              <p className="mt-1 text-pretty font-medium leading-7">
                {lesson.learningScenario.predict}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">{copy.scenarioMappingTitle}</h3>
            <div className="mt-3 overflow-hidden rounded-lg border">
              <table className="w-full table-fixed text-left text-sm leading-6">
                <thead className="bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <tr>
                    <th scope="col" className="w-[46%] px-4 py-2 font-semibold">
                      {copy.scenarioEverydayHeader}
                    </th>
                    <th scope="col" className="w-[8%] px-1 py-2 text-center font-semibold">
                      <span className="sr-only">對應到</span>
                    </th>
                    <th scope="col" className="w-[46%] px-4 py-2 font-semibold">
                      {copy.scenarioTechnicalHeader}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.learningScenario.mapping.map((item) => (
                    <tr key={`${item.everyday}-${item.technical}`} className="border-t">
                      <td className="px-4 py-3 align-top text-pretty">{item.everyday}</td>
                      <td
                        aria-hidden="true"
                        className="px-1 py-3 text-center align-top text-slate-600 dark:text-slate-300"
                      >
                        →
                      </td>
                      <td className="px-4 py-3 align-top text-pretty font-medium">
                        {item.technical}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-lg border-2 border-amber-700 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-50">
            <span className="font-semibold">{copy.scenarioBoundaryLabel}</span>{' '}
            <span className="text-pretty">{lesson.learningScenario.boundary}</span>
          </aside>

          <div>
            <h3 className="text-base font-semibold">{copy.scenarioCuesTitle}</h3>
            <ul className="mt-2 space-y-2">
              {lesson.learningScenario.examCues.map((cue) => (
                <li key={cue} className="flex gap-2 text-pretty text-sm leading-6">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {cue}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

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
            {section.interactiveBlocks?.map((block, blockIndex) => (
              <InteractiveBlock key={blockIndex} block={block} />
            ))}
          </section>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-balance text-lg font-semibold">{copy.workedExamplesTitle}</h2>
        <div className="space-y-3">
          {lesson.workedExamples.map((example, index) => (
            <div key={example.prompt} className="rounded-lg border p-4">
              <p className="text-pretty font-medium">
                {copy.workedExampleLabel} <span className="tabular-nums">{index + 1}</span>：
                {example.prompt}
              </p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                {example.steps.map((step) => (
                  <li key={step} className="text-pretty pl-1">
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-pretty text-sm">
                <span className="font-medium">{copy.workedExampleAnswerLabel}</span>
                {example.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-balance text-lg font-semibold">{copy.pitfallsTitle}</h2>
        <ul className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          {lesson.commonPitfalls.map((pitfall) => (
            <li key={pitfall} className="flex gap-2 text-pretty text-sm leading-6">
              <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              {pitfall}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-balance text-lg font-semibold">{copy.cardsTitle}</h2>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">{copy.cardsDescription}</p>
        </div>
        <div className="space-y-2">
          {cards.map((card, index) => (
            <details key={card.id} className="group rounded-lg border bg-card">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <span className="tabular-nums text-xs text-muted-foreground">{index + 1}</span>
                <span className="flex-1 text-pretty text-sm font-medium">{card.front}</span>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
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
        <h2 className="text-balance text-lg font-semibold">{practiceTitle}</h2>
        <p className="text-pretty text-sm text-muted-foreground">{practiceDescription}</p>
        <Link
          href={practiceHref}
          className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {practiceActionLabel}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="space-y-2">
        <h2 className="text-balance text-lg font-semibold">{copy.sourcesTitle}</h2>
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
