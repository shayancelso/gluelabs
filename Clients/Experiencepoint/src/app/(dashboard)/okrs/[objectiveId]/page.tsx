'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProgressRing } from '@/components/okr/progress-ring'
import { ConfidenceSlider, ConfidenceBadge } from '@/components/okr/confidence-slider'
import { LevelBadge, StatusBadge } from '@/components/okr/status-badge'
import { KeyResultCard } from '@/components/okr/key-result-card'
import { KeyResultForm } from '@/components/okr/key-result-form'
import { ObjectiveCard } from '@/components/okr/objective-card'
import { useStore } from '@/lib/store'
import { getInitials, formatDate } from '@/lib/utils'

interface PageProps {
  params: { objectiveId: string }
}

export default function ObjectiveDetailPage({ params }: PageProps) {
  const { objectiveId } = params
  const {
    getObjectiveById,
    getKeyResultsByObjectiveId,
    getUserById,
    getChildObjectives,
    okrCheckins,
    updateObjective,
  } = useStore()

  const [addKROpen, setAddKROpen] = useState(false)

  const objective = getObjectiveById(objectiveId)

  if (!objective) {
    notFound()
  }

  const keyResults = getKeyResultsByObjectiveId(objectiveId)
  const owner = getUserById(objective.ownerId)
  const parentObjective = objective.parentId ? getObjectiveById(objective.parentId) : null
  const childObjectives = getChildObjectives(objectiveId)

  const handleConfidenceChange = (newLevel: number) => {
    updateObjective(objective.id, { confidenceLevel: newLevel })
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/okrs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to OKRs
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <ProgressRing progress={objective.progress} size={120} strokeWidth={10} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge level={objective.level} />
                <StatusBadge status={objective.status} />
                <ConfidenceBadge value={objective.confidenceLevel} />
                <span className="text-sm text-muted-foreground ml-2">
                  {objective.timePeriod}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold">{objective.title}</h1>

              {objective.description && (
                <p className="text-muted-foreground">{objective.description}</p>
              )}

              {/* Owner */}
              {owner && (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarImage src={owner.avatarUrl} />
                    <AvatarFallback className="bg-sun-100 text-sun-700">
                      {getInitials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-muted-foreground">{owner.jobTitle}</p>
                  </div>
                </div>
              )}

              {/* Parent Objective Link */}
              {parentObjective && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Aligns to:
                  </p>
                  <Link
                    href={`/okrs/${parentObjective.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-sun transition-colors"
                  >
                    <ProgressRing progress={parentObjective.progress} size={40} showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <LevelBadge level={parentObjective.level} className="mb-1" />
                      <p className="font-medium truncate">{parentObjective.title}</p>
                    </div>
                    <span className="text-sm font-medium">{Math.round(parentObjective.progress)}%</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/okrs/${objective.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Update */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Level</CardTitle>
          <CardDescription>
            How confident are you in achieving this objective?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfidenceSlider
            value={objective.confidenceLevel}
            onChange={handleConfidenceChange}
          />
        </CardContent>
      </Card>

      {/* Key Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Key Results</h2>
            <p className="text-sm text-muted-foreground">
              Track measurable outcomes for this objective
            </p>
          </div>
          <Dialog open={addKROpen} onOpenChange={setAddKROpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Key Result
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Key Result</DialogTitle>
                <DialogDescription>
                  Define a measurable outcome for this objective.
                </DialogDescription>
              </DialogHeader>
              <KeyResultForm
                objectiveId={objective.id}
                onSuccess={() => setAddKROpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {keyResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No key results yet. Add measurable outcomes to track your progress.
              </p>
              <Button onClick={() => setAddKROpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Key Result
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {keyResults.map((kr) => (
              <KeyResultCard
                key={kr.id}
                keyResult={kr}
                checkins={okrCheckins.filter((c) => c.keyResultId === kr.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Child Objectives */}
      {childObjectives.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Aligned Objectives</h2>
            <p className="text-sm text-muted-foreground">
              Objectives that contribute to this one
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {childObjectives.map((child) => (
              <ObjectiveCard
                key={child.id}
                objective={child}
                keyResults={getKeyResultsByObjectiveId(child.id)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Meta info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created {formatDate(objective.createdAt)}</span>
            <span>Last updated {formatDate(objective.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
