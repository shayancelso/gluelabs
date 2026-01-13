'use client'

import { useState } from 'react'
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
import { useStore } from '@/lib/store'
import type { KeyResult, MetricType } from '@/lib/types'

interface KeyResultFormProps {
  objectiveId: string
  keyResult?: KeyResult
  onSuccess?: () => void
}

export function KeyResultForm({ objectiveId, keyResult, onSuccess }: KeyResultFormProps) {
  const { addKeyResult, updateKeyResult, currentUser, getKeyResultsByObjectiveId } = useStore()

  const [title, setTitle] = useState(keyResult?.title || '')
  const [description, setDescription] = useState(keyResult?.description || '')
  const [metricType, setMetricType] = useState<MetricType>(keyResult?.metricType || 'number')
  const [startValue, setStartValue] = useState(keyResult?.startValue || 0)
  const [targetValue, setTargetValue] = useState(keyResult?.targetValue || 100)
  const [currentValue, setCurrentValue] = useState(keyResult?.currentValue || 0)
  const [unit, setUnit] = useState(keyResult?.unit || '')
  const [confidenceLevel, setConfidenceLevel] = useState(keyResult?.confidenceLevel || 7)
  const [weight, setWeight] = useState(keyResult?.weight || 1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const existingKRs = getKeyResultsByObjectiveId(objectiveId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      if (keyResult) {
        updateKeyResult(keyResult.id, {
          title,
          description: description || undefined,
          metricType,
          startValue,
          targetValue,
          currentValue,
          unit: unit || undefined,
          confidenceLevel,
          weight,
        })
      } else {
        addKeyResult({
          objectiveId,
          ownerId: currentUser.id,
          title,
          description: description || undefined,
          metricType,
          startValue,
          targetValue,
          currentValue,
          unit: unit || undefined,
          confidenceLevel,
          weight,
          sortOrder: existingKRs.length,
        })
      }

      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Key Result *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Increase revenue to $1M"
          required
        />
        <p className="text-xs text-muted-foreground">
          Make it specific and measurable
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more context..."
          rows={2}
        />
      </div>

      {/* Metric Type */}
      <div className="space-y-2">
        <Label htmlFor="metricType">Metric Type *</Label>
        <Select value={metricType} onValueChange={(v) => setMetricType(v as MetricType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number (e.g., 100 users)</SelectItem>
            <SelectItem value="percentage">Percentage (e.g., 95%)</SelectItem>
            <SelectItem value="currency">Currency (e.g., $10,000)</SelectItem>
            <SelectItem value="binary">Binary (Done / Not Done)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Values */}
      {metricType !== 'binary' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startValue">Start Value</Label>
            <Input
              id="startValue"
              type="number"
              value={startValue}
              onChange={(e) => setStartValue(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentValue">Current Value</Label>
            <Input
              id="currentValue"
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value *</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
              step="0.01"
              required
            />
          </div>
        </div>
      )}

      {/* Unit */}
      {metricType !== 'binary' && metricType !== 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="unit">Unit (optional)</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={metricType === 'currency' ? '$' : 'e.g., users, deals, hours'}
          />
        </div>
      )}

      {/* Weight */}
      <div className="space-y-2">
        <Label htmlFor="weight">Weight</Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
          min="0.1"
          max="10"
          step="0.1"
        />
        <p className="text-xs text-muted-foreground">
          Higher weight = more impact on objective progress (default: 1)
        </p>
      </div>

      {/* Confidence Level */}
      <ConfidenceSlider
        value={confidenceLevel}
        onChange={setConfidenceLevel}
      />

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting
            ? 'Saving...'
            : keyResult
            ? 'Update Key Result'
            : 'Add Key Result'}
        </Button>
      </div>
    </form>
  )
}
