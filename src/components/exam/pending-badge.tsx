import { Badge } from '@/components/ui/badge'

interface PendingBadgeProps {
  label?: string
}

export function PendingBadge({ label = '待確認' }: PendingBadgeProps) {
  return (
    <Badge variant="pending" title="此資料尚未官方確認">
      ⚠ {label}
    </Badge>
  )
}
