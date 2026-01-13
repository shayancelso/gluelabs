'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { getWeekStartDate, formatDate, getPulseEmoji, getPulseLabel, cn } from '@/lib/utils'
import type { PulseRating } from '@/lib/types'

export default function NewCheckinPage() {
  const router = useRouter()
  const { addWeeklyCheckin, addCheckinResponse, checkinQuestions, currentUser } = useStore()

  const [pulseRating, setPulseRating] = useState<PulseRating>(3)
  const [pulseComment, setPulseComment] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekStart = getWeekStartDate()

  // Get 3 random questions for this week
  const activeQuestions = checkinQuestions.filter((q) => q.isActive).slice(0, 3)

  const handleSubmit = async () => {
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      const checkin = addWeeklyCheckin({
        authorId: currentUser.id,
        weekStartDate: weekStart,
        pulseRating,
        pulseComment: pulseComment.trim() || undefined,
        status: 'submitted',
        submittedAt: new Date(),
      })

      // Add responses
      activeQuestions.forEach((question) => {
        if (responses[question.id]?.trim()) {
          addCheckinResponse({
            checkinId: checkin.id,
            questionId: question.id,
            responseText: responses[question.id].trim(),
          })
        }
      })

      router.push('/checkins')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Check-in</h1>
        <p className="text-muted-foreground">
          Week of {formatDate(weekStart)}
        </p>
      </div>

      {/* Pulse Rating */}
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling this week?</CardTitle>
          <CardDescription>
            Your pulse rating helps your team understand how you&apos;re doing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 mb-6">
            {([1, 2, 3, 4, 5] as PulseRating[]).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setPulseRating(rating)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  pulseRating === rating
                    ? 'border-sun bg-sun-100 scale-110'
                    : 'border-transparent hover:border-gray-200'
                )}
              >
                <span className="text-4xl">{getPulseEmoji(rating)}</span>
                <span className="text-sm font-medium">{getPulseLabel(rating)}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulseComment">Any additional context? (optional)</Label>
            <Textarea
              id="pulseComment"
              value={pulseComment}
              onChange={(e) => setPulseComment(e.target.value)}
              placeholder="Share what's on your mind..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {activeQuestions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {index + 1}. {question.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={responses[question.id] || ''}
              onChange={(e) =>
                setResponses((prev) => ({
                  ...prev,
                  [question.id]: e.target.value,
                }))
              }
              placeholder="Your response..."
              rows={4}
            />
          </CardContent>
        </Card>
      ))}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
        </Button>
      </div>
    </div>
  )
}
