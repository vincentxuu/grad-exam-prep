import { cn } from '@/lib/utils'
import type { ImportanceRating } from '@/types/content'

interface ImportanceStarsProps {
  rating: ImportanceRating
  className?: string
}

const LABELS: Record<ImportanceRating, string> = {
  1: '低',
  2: '中低',
  3: '中',
  4: '高',
  5: '必考',
}

export function ImportanceStars({ rating, className }: ImportanceStarsProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      title={`重要度：${LABELS[rating]}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn('text-xs', i < rating ? 'text-amber-400' : 'text-muted-foreground/30')}
        >
          ★
        </span>
      ))}
      {rating === 5 && (
        <span className="ml-1 text-xs font-medium text-amber-600 dark:text-amber-400">必考</span>
      )}
    </span>
  )
}
