import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { LearningCatalog } from '@/lib/learning'
import type { ImportanceRating } from '@/types/content'
import { ImportanceStars } from './importance-stars'

interface Props {
  catalog: LearningCatalog
}

export function LearningConceptOverview({ catalog }: Props) {
  const overview = catalog.overview
  if (!overview) return null

  const { copy, topics } = overview
  const totalSubtopicCount = topics.reduce((total, topic) => total + topic.subtopics.length, 0)
  const coveredSubtopicCount = new Set(
    catalog.lessons.flatMap((lesson) => lesson.coveredSubtopicIds)
  ).size

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{copy.taxonomyBadge}</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">
            {topics.length} 大主題 · {totalSubtopicCount} {copy.subtopicUnit} ·{' '}
            {overview.totalQuestions} {copy.topicQuestionUnit}
          </span>
        </div>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          {copy.eligibilityPrefix}{' '}
          <span className="font-medium tabular-nums text-foreground">
            {overview.eligibleCount} 題
          </span>
          {copy.eligibleSuffix} {copy.disputedPrefix}{' '}
          <span className="font-medium tabular-nums text-foreground">
            {overview.disputedCount} 題
          </span>
          {copy.disputedSuffix}
        </p>
        <Link
          href={overview.browseHref}
          className="mt-3 inline-flex min-h-9 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copy.browseLabel}
        </Link>
      </div>

      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-balance font-semibold">{copy.moduleTitle}</h3>
            <Badge variant="outline">
              <span className="tabular-nums">
                {coveredSubtopicCount} / {totalSubtopicCount}
              </span>{' '}
              {copy.subtopicUnit}
            </Badge>
          </div>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">{copy.moduleDescription}</p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {catalog.lessons.map((lesson) => {
            const cardCount = catalog.getCardsForLesson(lesson.id).length
            return (
              <li key={lesson.id} className="flex flex-col rounded-lg border bg-card p-4">
                <h4 className="text-balance text-sm font-semibold">{lesson.title}</h4>
                <p className="mt-2 line-clamp-3 flex-1 text-pretty text-xs leading-5 text-muted-foreground">
                  {lesson.summary}
                </p>
                <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                  約 {lesson.estimatedMinutes} 分鐘 · {cardCount} 張概念卡 ·{' '}
                  {lesson.pastPaperRefs.length} {copy.lessonQuestionUnit}
                </p>
                <Link
                  href={`${catalog.lessonBaseHref}/${lesson.id}`}
                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {copy.lessonActionLabel}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <ul className="space-y-2">
        {[...topics]
          .sort((a, b) => b.importance - a.importance)
          .map((topic) => (
            <li key={topic.id}>
              <details className="group rounded-lg border bg-card">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  <span aria-hidden="true" className="text-muted-foreground group-open:rotate-90">
                    ›
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-balance text-sm font-medium">{topic.title}</span>
                    <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                      {topic.subtopics.length} {copy.subtopicUnit} ·{' '}
                      {overview.topicQuestionCounts[topic.id] ?? 0} {copy.topicQuestionUnit}
                    </span>
                  </span>
                  <ImportanceStars
                    rating={topic.importance as ImportanceRating}
                    className="shrink-0"
                  />
                </summary>

                <div className="border-t px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {copy.objectivesLabel}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {topic.learningObjectives.map((objective) => (
                      <li key={objective.id} className="flex gap-2 text-pretty text-sm">
                        <span aria-hidden="true" className="text-muted-foreground">
                          ·
                        </span>
                        {objective.statement}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs font-medium text-muted-foreground">
                    {copy.subtopicsLabel}
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {topic.subtopics.map((subtopic) => (
                      <li key={subtopic.id} className="rounded-md bg-muted/50 px-3 py-2">
                        <p className="text-sm font-medium">{subtopic.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {subtopic.keywords.join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
      </ul>
    </div>
  )
}
