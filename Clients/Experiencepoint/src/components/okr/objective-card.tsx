'use client'

import Link from 'next/link'
import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProgressRing } from './progress-ring'
import { ConfidenceBadge } from './confidence-slider'
import { LevelBadge, StatusBadge } from './status-badge'
import { useStore } from '@/lib/store'
import { getInitials, formatProgress } from '@/lib/utils'
import type { Objective, KeyResult } from '@/lib/types'

interface ObjectiveCardProps {
  objective: Objective
  keyResults?: KeyResult[]
  showOwner?: boolean
  showActions?: boolean
  compact?: boolean
}

export function ObjectiveCard({
  objective,
  keyResults = [],
  showOwner = true,
  showActions = true,
  compact = false,
}: ObjectiveCardProps) {
  const { getUserById, deleteObjective } = useStore()
  const owner = getUserById(objective.ownerId)

  if (compact) {
    return (
      <Link
        href={`/okrs/${objective.id}`}
        className="block p-4 rounded-lg border hover:border-sun transition-colors bg-white"
      >
        <div className="flex items-center gap-4">
          <ProgressRing progress={objective.progress} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <LevelBadge level={objective.level} />
              <ConfidenceBadge value={objective.confidenceLevel} />
            </div>
            <h4 className="font-medium truncate">{objective.title}</h4>
            <p className="text-sm text-muted-foreground">
              {keyResults.length} key results
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Link>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Progress Ring */}
          <ProgressRing progress={objective.progress} size={72} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <LevelBadge level={objective.level} />
                <StatusBadge status={objective.status} />
                <ConfidenceBadge value={objective.confidenceLevel} />
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/okrs/${objective.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => deleteObjective(objective.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Title */}
            <Link href={`/okrs/${objective.id}`}>
              <h3 className="font-semibold text-lg hover:text-sun-600 transition-colors">
                {objective.title}
              </h3>
            </Link>

            {objective.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {objective.description}
              </p>
            )}

            {/* Key Results Preview */}
            {keyResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {keyResults.slice(0, 3).map((kr) => (
                  <div
                    key={kr.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Progress
                      value={kr.progress}
                      className="w-20 h-1.5"
                      indicatorClassName={
                        kr.status === 'on_track' || kr.status === 'completed'
                          ? 'bg-on-track'
                          : kr.status === 'at_risk'
                          ? 'bg-at-risk'
                          : 'bg-off-track'
                      }
                    />
                    <span className="truncate flex-1">{kr.title}</span>
                    <span className="text-muted-foreground">
                      {formatProgress(kr.progress)}
                    </span>
                  </div>
                ))}
                {keyResults.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{keyResults.length - 3} more key results
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              {showOwner && owner && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={owner.avatarUrl} />
                    <AvatarFallback className="text-xs bg-sun-100 text-sun-700">
                      {getInitials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {owner.name}
                  </span>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {objective.timePeriod}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
