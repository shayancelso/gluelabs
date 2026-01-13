'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfidenceSlider } from './confidence-slider'
import { useStore } from '@/lib/store'
import { formatMetricValue } from '@/lib/utils'
import type { KeyResult } from '@/lib/types'

interface OKRCheckinFormProps {
  keyResult: KeyResult
  onSuccess?: () => void
}

export function OKRCheckinForm({ keyResult, onSuccess }: OKRCheckinFormProps) {
  const { addOKRCheckin, currentUser } = useStore()

  const [newValue, setNewValue] = useState(keyResult.currentValue)
  const [confidenceLevel, setConfidenceLevel] = useState(keyResult.confidenceLevel)
  const [notes, setNotes] = useState('')
  const [blockers, setBlockers] = useState('')
  const [wins, setWins] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      addOKRCheckin({
        keyResultId: keyResult.id,
        authorId: currentUser.id,
        previousValue: keyResult.currentValue,
        newValue,
        confidenceLevel,
        notes: notes.trim() || undefined,
        blockers: blockers.trim() || undefined,
        wins: wins.trim() || undefined,
      })

      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Progress */}
      <div className="p-4 rounded-lg bg-muted">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Current Value</span>
          <span className="font-medium">
            {formatMetricValue(keyResult.currentValue, keyResult.metricType, keyResult.unit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Target</span>
          <span className="font-medium">
            {formatMetricValue(keyResult.targetValue, keyResult.metricType, keyResult.unit)}
          </span>
        </div>
      </div>

      {/* New Value */}
      <div className="space-y-2">
        <Label htmlFor="newValue">New Value</Label>
        <div className="flex items-center gap-2">
          <Input
            id="newValue"
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
            step={keyResult.metricType === 'binary' ? 1 : 0.01}
            min={0}
            className="flex-1"
          />
          {keyResult.unit && (
            <span className="text-sm text-muted-foreground">{keyResult.unit}</span>
          )}
        </div>
        {keyResult.metricType === 'binary' && (
          <p className="text-xs text-muted-foreground">
            Enter 1 for complete, 0 for not complete
          </p>
        )}
      </div>

      {/* Confidence Level */}
      <ConfidenceSlider
        value={confidenceLevel}
        onChange={setConfidenceLevel}
      />

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What progress did you make? Any context to share?"
          rows={3}
        />
      </div>

      {/* Wins */}
      <div className="space-y-2">
        <Label htmlFor="wins" className="flex items-center gap-2">
          <span className="text-lg">🎉</span> Wins (optional)
        </Label>
        <Textarea
          id="wins"
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          placeholder="What went well? Celebrate your achievements!"
          rows={2}
        />
      </div>

      {/* Blockers */}
      <div className="space-y-2">
        <Label htmlFor="blockers" className="flex items-center gap-2">
          <span className="text-lg">🚧</span> Blockers (optional)
        </Label>
        <Textarea
          id="blockers"
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder="Any challenges or blockers slowing you down?"
          rows={2}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Check-in'}
        </Button>
      </div>
    </form>
  )
}
