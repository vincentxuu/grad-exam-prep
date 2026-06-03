import type { Topic } from '@/types/content'
import { ImportanceStars } from './importance-stars'

interface TopicTreeProps {
  topics: Topic[]
}

export function TopicTree({ topics }: TopicTreeProps) {
  if (!topics.length) {
    return <p className="text-sm text-muted-foreground">尚無主題資料</p>
  }

  const sorted = [...topics].sort((a, b) => b.importance - a.importance)

  return (
    <ul className="space-y-2">
      {sorted.map((topic) => (
        <li key={topic.id} className="text-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">{topic.title}</span>
            <ImportanceStars rating={topic.importance} className="shrink-0 mt-0.5" />
          </div>
          {topic.subtopics && topic.subtopics.length > 0 && (
            <ul className="mt-1 ml-3 space-y-0.5">
              {topic.subtopics.map((sub) => (
                <li key={sub} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-muted-foreground/40">·</span>
                  {sub}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
