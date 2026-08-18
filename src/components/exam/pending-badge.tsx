import { TriangleAlert } from '@sketchyicons/react'
import { Badge } from '@/components/ui/badge'

interface PendingBadgeProps {
  label?: string
}

export function PendingBadge({ label = '待確認' }: PendingBadgeProps) {
  return (
    <Badge variant="pending" className="gap-1" title="此資料尚未官方確認">
      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}
