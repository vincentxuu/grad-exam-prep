import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ImportanceRating, Subject } from '@/types/content'
import { ImportanceStars } from './importance-stars'

interface SubjectCardProps {
  subject: Subject
  href: string
}

function avgImportance(subject: Subject): ImportanceRating {
  if (!subject.topics.length) return 3
  const avg = subject.topics.reduce((sum, t) => sum + t.importance, 0) / subject.topics.length
  return Math.round(avg) as ImportanceRating
}

export function SubjectCard({ subject, href }: SubjectCardProps) {
  const topTopics = [...subject.topics].sort((a, b) => b.importance - a.importance).slice(0, 3)

  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-start justify-between gap-2">
            <span>{subject.name}</span>
            <ImportanceStars rating={avgImportance(subject)} className="shrink-0 mt-0.5" />
          </CardTitle>
          {subject.weight != null && (
            <p className="text-xs text-muted-foreground">加權 {subject.weight}%</p>
          )}
        </CardHeader>
        <CardContent className="space-y-1">
          {topTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{topic.title}</span>
              <ImportanceStars rating={topic.importance} className="shrink-0 ml-2" />
            </div>
          ))}
          {subject.topics.length > 3 && (
            <p className="text-xs text-muted-foreground">+{subject.topics.length - 3} 個主題</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
