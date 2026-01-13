import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { KeyResultStatus, ObjectiveStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: KeyResultStatus | ObjectiveStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'on_track':
      case 'completed':
      case 'active':
        return 'success'
      case 'at_risk':
        return 'warning'
      case 'off_track':
      case 'cancelled':
        return 'danger'
      case 'draft':
      default:
        return 'secondary'
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'on_track':
        return 'On Track'
      case 'at_risk':
        return 'At Risk'
      case 'off_track':
        return 'Off Track'
      case 'completed':
        return 'Completed'
      case 'active':
        return 'Active'
      case 'draft':
        return 'Draft'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  return (
    <Badge variant={getVariant()} className={cn('capitalize', className)}>
      {getLabel()}
    </Badge>
  )
}

// Level badge for objectives
interface LevelBadgeProps {
  level: 'company' | 'department' | 'team' | 'individual'
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const getVariant = () => {
    switch (level) {
      case 'company':
        return 'default'
      case 'department':
        return 'secondary'
      case 'team':
        return 'outline'
      case 'individual':
      default:
        return 'outline'
    }
  }

  const getIcon = () => {
    switch (level) {
      case 'company':
        return '🏢'
      case 'department':
        return '🏛️'
      case 'team':
        return '👥'
      case 'individual':
        return '👤'
    }
  }

  return (
    <Badge variant={getVariant()} className={cn('gap-1', className)}>
      <span>{getIcon()}</span>
      {level}
    </Badge>
  )
}
