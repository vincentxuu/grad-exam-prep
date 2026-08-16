import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getImItCardsForLesson, getImItLessons } from '@/lib/im-it-learning'
import type { ImportanceRating } from '@/types/content'
import conceptMasterRaw from '../../../public/data/im-it-concept-master.json'
import questionMetadataRaw from '../../../public/data/im-it-question-metadata.json'
import { ImportanceStars } from './importance-stars'

const questionCounts = new Map<string, number>()
for (const question of questionMetadataRaw.questions) {
  questionCounts.set(question.topicId, (questionCounts.get(question.topicId) ?? 0) + 1)
}

export function ImItConceptOverview() {
  const eligibleCount = questionMetadataRaw.answerReview.autoGradeEligible
  const disputedCount = questionMetadataRaw.answerReview.disputed
  const lessons = getImItLessons()
  const totalSubtopicCount = conceptMasterRaw.topics.reduce(
    (total, topic) => total + topic.subtopics.length,
    0
  )
  const coveredSubtopicCount = new Set(lessons.flatMap((lesson) => lesson.coveredSubtopicIds)).size

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">分類已審核</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">
            {conceptMasterRaw.topics.length} 大主題 · {totalSubtopicCount} 個子主題 ·{' '}
            {questionMetadataRaw.totalQuestions} 題
          </span>
        </div>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          目前有{' '}
          <span className="font-medium tabular-nums text-foreground">{eligibleCount} 題</span>
          完成可重現的技術覆核，可用於單題練習；另有{' '}
          <span className="font-medium tabular-nums text-foreground">{disputedCount} 題</span>
          答案存在爭議，只提供瀏覽、不判分。全部答案皆非官方答案，暫不列入完整模擬考成績。
        </p>
        <Link
          href="/im/questions?subject=im-it"
          className="mt-3 inline-flex min-h-9 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          瀏覽 260 題計概題庫
        </Link>
      </div>

      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-balance font-semibold">已上線學習模組</h3>
            <Badge variant="outline">
              <span className="tabular-nums">
                {coveredSubtopicCount} / {totalSubtopicCount}
              </span>{' '}
              個子主題
            </Badge>
          </div>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            從考古題出現頻率高、且內容已完成獨立複查的主題開始。每堂包含短講義、解題範例、概念卡與已覆核考古題。
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson) => {
            const cardCount = getImItCardsForLesson(lesson.id).length
            return (
              <li key={lesson.id} className="flex flex-col rounded-lg border bg-card p-4">
                <h4 className="text-balance text-sm font-semibold">{lesson.title}</h4>
                <p className="mt-2 line-clamp-3 flex-1 text-pretty text-xs leading-5 text-muted-foreground">
                  {lesson.summary}
                </p>
                <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                  約 {lesson.estimatedMinutes} 分鐘 · {cardCount} 張概念卡 ·{' '}
                  {lesson.pastPaperRefs.length} 題
                </p>
                <Link
                  href={`/im/subjects/im-it/lessons/${lesson.id}`}
                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  開始學習
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <ul className="space-y-2">
        {[...conceptMasterRaw.topics]
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
                      {topic.subtopics.length} 個子主題 · {questionCounts.get(topic.id) ?? 0} 題
                    </span>
                  </span>
                  <ImportanceStars
                    rating={topic.importance as ImportanceRating}
                    className="shrink-0"
                  />
                </summary>

                <div className="border-t px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">學習目標</p>
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

                  <p className="mt-4 text-xs font-medium text-muted-foreground">子主題</p>
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
