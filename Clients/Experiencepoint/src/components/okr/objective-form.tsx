'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfidenceSlider } from './confidence-slider'
import { AISuggestions } from './ai-suggestions'
import { useStore } from '@/lib/store'
import { getCurrentTimePeriod, getTimePeriods } from '@/lib/utils'
import type { Objective, ObjectiveLevel, KeyResultMetricType } from '@/lib/types'

interface SuggestedKeyResult {
  title: string
  metricType: KeyResultMetricType
  startValue: number
  targetValue: number
  unit?: string
}

interface SuggestedOKR {
  objective: {
    title: string
    description?: string
  }
  keyResults: SuggestedKeyResult[]
}

interface ObjectiveFormProps {
  objective?: Objective
  parentId?: string
  onSuccess?: () => void
}

export function ObjectiveForm({ objective, parentId, onSuccess }: ObjectiveFormProps) {
  const router = useRouter()
  const { addObjective, updateObjective, addKeyResult, currentUser, objectives, teams, departments } = useStore()

  const [title, setTitle] = useState(objective?.title || '')
  const [description, setDescription] = useState(objective?.description || '')
  const [level, setLevel] = useState<ObjectiveLevel>(objective?.level || 'individual')
  const [timePeriod, setTimePeriod] = useState(objective?.timePeriod || getCurrentTimePeriod())
  const [selectedParentId, setSelectedParentId] = useState(objective?.parentId || parentId || '')
  const [teamId, setTeamId] = useState(objective?.teamId || '')
  const [departmentId, setDepartmentId] = useState(objective?.departmentId || '')
  const [confidenceLevel, setConfidenceLevel] = useState(objective?.confidenceLevel || 7)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedKeyResults, setSuggestedKeyResults] = useState<SuggestedKeyResult[]>([])

  const parentObjectives = objectives.filter(
    (obj) => obj.id !== objective?.id && obj.timePeriod === timePeriod
  )

  const selectedParent = parentObjectives.find(obj => obj.id === selectedParentId)

  const handleAISuggestion = (suggestion: SuggestedOKR) => {
    setTitle(suggestion.objective.title)
    if (suggestion.objective.description) {
      setDescription(suggestion.objective.description)
    }
    if (suggestion.keyResults && suggestion.keyResults.length > 0) {
      setSuggestedKeyResults(suggestion.keyResults)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      if (objective) {
        updateObjective(objective.id, {
          title,
          description: description || undefined,
          level,
          timePeriod,
          parentId: selectedParentId || undefined,
          teamId: teamId || undefined,
          departmentId: departmentId || undefined,
          confidenceLevel,
        })
        onSuccess?.()
      } else {
        const newObjective = addObjective({
          title,
          description: description || undefined,
          level,
          ownerId: currentUser.id,
          timePeriod,
          parentId: selectedParentId || undefined,
          teamId: teamId || undefined,
          departmentId: departmentId || undefined,
          confidenceLevel,
          status: 'active',
        })

        // Add suggested key results if any
        if (suggestedKeyResults.length > 0) {
          suggestedKeyResults.forEach((kr) => {
            addKeyResult({
              objectiveId: newObjective.id,
              title: kr.title,
              metricType: kr.metricType,
              startValue: kr.startValue,
              targetValue: kr.targetValue,
              currentValue: kr.startValue,
              unit: kr.unit,
              confidenceLevel: 7,
            })
          })
        }

        router.push(`/okrs/${newObjective.id}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const timePeriods = [
    ...getTimePeriods(currentYear),
    ...getTimePeriods(currentYear + 1),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Suggestions - only show for new objectives */}
      {!objective && (
        <AISuggestions
          level={level}
          timePeriod={timePeriod}
          parentObjective={selectedParent ? { title: selectedParent.title, description: selectedParent.description } : undefined}
          onAccept={handleAISuggestion}
        />
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Objective Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to achieve?"
          required
        />
        <p className="text-xs text-muted-foreground">
          Make it inspiring and outcome-focused
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more context about this objective..."
          rows={3}
        />
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label htmlFor="level">Level *</Label>
        <Select value={level} onValueChange={(v) => setLevel(v as ObjectiveLevel)}>
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">🏢 Company</SelectItem>
            <SelectItem value="department">🏛️ Department</SelectItem>
            <SelectItem value="team">👥 Team</SelectItem>
            <SelectItem value="individual">👤 Individual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Period */}
      <div className="space-y-2">
        <Label htmlFor="timePeriod">Time Period *</Label>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger>
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Parent Objective (for alignment) */}
      <div className="space-y-2">
        <Label htmlFor="parentId">Aligns to (optional)</Label>
        <Select value={selectedParentId || 'none'} onValueChange={(v) => setSelectedParentId(v === 'none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select parent objective" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {parentObjectives.map((obj) => (
              <SelectItem key={obj.id} value={obj.id}>
                {obj.level === 'company' && '🏢 '}
                {obj.level === 'department' && '🏛️ '}
                {obj.level === 'team' && '👥 '}
                {obj.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Link this objective to a higher-level goal for cascade alignment
        </p>
      </div>

      {/* Team (if team level) */}
      {level === 'team' && (
        <div className="space-y-2">
          <Label htmlFor="teamId">Team</Label>
          <Select value={teamId || 'none'} onValueChange={(v) => setTeamId(v === 'none' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Department (if department level) */}
      {level === 'department' && (
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select value={departmentId || 'none'} onValueChange={(v) => setDepartmentId(v === 'none' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Suggested Key Results Preview */}
      {suggestedKeyResults.length > 0 && (
        <div className="space-y-3 p-4 bg-sun-50 rounded-lg border border-sun/30">
          <div className="flex items-center justify-between">
            <Label className="text-sun-dark">Suggested Key Results ({suggestedKeyResults.length})</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSuggestedKeyResults([])}
              className="text-muted-foreground hover:text-foreground h-8"
            >
              Clear
            </Button>
          </div>
          <ul className="space-y-2">
            {suggestedKeyResults.map((kr, index) => (
              <li key={index} className="text-sm flex items-start gap-2 bg-white p-2 rounded border">
                <span className="font-medium text-sun">{index + 1}.</span>
                <div className="flex-1">
                  <span>{kr.title}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({kr.metricType}: {kr.startValue} → {kr.targetValue}{kr.unit ? ` ${kr.unit}` : ''})
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            These key results will be created with your objective
          </p>
        </div>
      )}

      {/* Confidence Level */}
      <ConfidenceSlider
        value={confidenceLevel}
        onChange={setConfidenceLevel}
      />

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting
            ? 'Saving...'
            : objective
            ? 'Update Objective'
            : 'Create Objective'}
        </Button>
      </div>
    </form>
  )
}
