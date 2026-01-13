'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, RefreshCw, Check, X } from 'lucide-react'
import { ObjectiveLevel, KeyResultMetricType } from '@/lib/types'

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

interface AISuggestionsProps {
  level: ObjectiveLevel
  timePeriod: string
  parentObjective?: { title: string; description?: string }
  onAccept: (suggestion: SuggestedOKR) => void
  existingObjectiveTitle?: string
  existingKeyResults?: SuggestedKeyResult[]
}

export function AISuggestions({
  level,
  timePeriod,
  parentObjective,
  onAccept,
  existingObjectiveTitle,
  existingKeyResults,
}: AISuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [suggestion, setSuggestion] = useState<SuggestedOKR | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestion = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/suggest-okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_objective',
          level,
          timePeriod,
          parentObjective,
          userInput: userInput || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestion')
      }

      setSuggestion(data.suggestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestMoreKeyResults = async () => {
    if (!existingObjectiveTitle) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/suggest-okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_key_results',
          objectiveTitle: existingObjectiveTitle,
          existingKeyResults: existingKeyResults || [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions')
      }

      // For key results, the response is an array
      setSuggestion({
        objective: { title: existingObjectiveTitle },
        keyResults: data.suggestion,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion)
      setSuggestion(null)
      setIsOpen(false)
      setUserInput('')
    }
  }

  const handleReject = () => {
    setSuggestion(null)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4 text-sun" />
        AI Suggestions
      </Button>
    )
  }

  return (
    <Card className="border-sun/50 bg-sun-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sun" />
            <CardTitle className="text-lg">AI OKR Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false)
              setSuggestion(null)
              setError(null)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Get AI-powered suggestions for your {level} OKR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestion && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ai-input">What would you like to achieve? (optional)</Label>
              <Input
                id="ai-input"
                placeholder="e.g., Improve customer satisfaction, Increase revenue..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for general suggestions based on {level} priorities
              </p>
            </div>

            {parentObjective && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Aligning with:</p>
                <p className="text-sm font-medium">{parentObjective.title}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={generateSuggestion}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate OKR
                  </>
                )}
              </Button>

              {existingObjectiveTitle && (
                <Button
                  variant="outline"
                  onClick={suggestMoreKeyResults}
                  disabled={isLoading}
                >
                  Suggest KRs
                </Button>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {suggestion && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Suggested Objective</p>
                <p className="font-semibold">{suggestion.objective.title}</p>
                {suggestion.objective.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.objective.description}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Key Results</p>
                <ul className="space-y-2">
                  {suggestion.keyResults.map((kr, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="font-medium text-sun">{index + 1}.</span>
                      <div>
                        <span>{kr.title}</span>
                        <span className="text-muted-foreground ml-2">
                          ({kr.startValue} → {kr.targetValue}
                          {kr.unit ? ` ${kr.unit}` : ''})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAccept} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button variant="outline" onClick={handleReject} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function AISuggestButton({
  onClick,
  isLoading,
  label = 'AI Suggest',
}: {
  onClick: () => void
  isLoading?: boolean
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className="h-8 text-sun hover:text-sun-dark hover:bg-sun-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  )
}
