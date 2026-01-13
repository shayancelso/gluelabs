'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ConfidenceBadge } from './confidence-slider'
import { StatusBadge } from './status-badge'
import { OKRCheckinForm } from './okr-checkin-form'
import { useStore } from '@/lib/store'
import { formatMetricValue, formatProgress, formatRelativeTime } from '@/lib/utils'
import type { KeyResult, OKRCheckin } from '@/lib/types'

interface KeyResultCardProps {
  keyResult: KeyResult
  checkins?: OKRCheckin[]
  showActions?: boolean
  onEdit?: () => void
}

export function KeyResultCard({
  keyResult,
  checkins = [],
  showActions = true,
  onEdit,
}: KeyResultCardProps) {
  const { deleteKeyResult } = useStore()
  const [checkinOpen, setCheckinOpen] = useState(false)

  const lastCheckin = checkins[checkins.length - 1]

  const getProgressColor = () => {
    if (keyResult.status === 'completed' || keyResult.status === 'on_track') return 'bg-on-track'
    if (keyResult.status === 'at_risk') return 'bg-at-risk'
    return 'bg-off-track'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={keyResult.status} />
                <ConfidenceBadge value={keyResult.confidenceLevel} />
              </div>
              <h4 className="font-medium">{keyResult.title}</h4>
              {keyResult.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {keyResult.description}
                </p>
              )}
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteKeyResult(keyResult.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{formatProgress(keyResult.progress)}</span>
            </div>
            <Progress
              value={keyResult.progress}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Start: {formatMetricValue(keyResult.startValue, keyResult.metricType, keyResult.unit)}
              </span>
              <span>
                Current: {formatMetricValue(keyResult.currentValue, keyResult.metricType, keyResult.unit)}
              </span>
              <span>
                Target: {formatMetricValue(keyResult.targetValue, keyResult.metricType, keyResult.unit)}
              </span>
            </div>
          </div>

          {/* Last Check-in */}
          {lastCheckin && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Last check-in {formatRelativeTime(lastCheckin.createdAt)}</span>
              </div>
              {lastCheckin.notes && (
                <p className="text-sm bg-muted p-2 rounded-md">{lastCheckin.notes}</p>
              )}
            </div>
          )}

          {/* Check-in Button */}
          <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Update Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Update Progress</DialogTitle>
                <DialogDescription>
                  Record your progress on this key result.
                </DialogDescription>
              </DialogHeader>
              <OKRCheckinForm
                keyResult={keyResult}
                onSuccess={() => setCheckinOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
