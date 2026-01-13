import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { KeyResult, KeyResultStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID()
}

// Calculate key result progress based on metric type
export function calculateKeyResultProgress(kr: KeyResult): number {
  if (kr.metricType === 'binary') {
    return kr.currentValue >= 1 ? 100 : 0
  }

  const range = kr.targetValue - kr.startValue
  if (range === 0) return 0

  const progress = ((kr.currentValue - kr.startValue) / range) * 100
  return Math.min(100, Math.max(0, progress))
}

// Calculate objective progress from key results
export function calculateObjectiveProgress(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0

  const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0)
  if (totalWeight === 0) return 0

  const weightedProgress = keyResults.reduce((sum, kr) => {
    return sum + kr.progress * kr.weight
  }, 0)

  return Math.round(weightedProgress / totalWeight)
}

// Determine key result status based on progress and confidence
export function determineKeyResultStatus(
  progress: number,
  confidenceLevel: number
): KeyResultStatus {
  if (progress >= 100) return 'completed'
  if (progress >= 70 && confidenceLevel >= 7) return 'on_track'
  if (progress >= 40 || confidenceLevel >= 4) return 'at_risk'
  return 'off_track'
}

// Format progress for display
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`
}

// Format metric value based on type
export function formatMetricValue(
  value: number,
  metricType: string,
  unit?: string
): string {
  switch (metricType) {
    case 'percentage':
      return `${value}%`
    case 'currency':
      return `${unit || '$'}${value.toLocaleString()}`
    case 'binary':
      return value >= 1 ? 'Complete' : 'Not Complete'
    default:
      return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString()
  }
}

// Get status color class
export function getStatusColor(status: KeyResultStatus): string {
  switch (status) {
    case 'on_track':
    case 'completed':
      return 'text-on-track bg-on-track-light'
    case 'at_risk':
      return 'text-at-risk bg-at-risk-light'
    case 'off_track':
      return 'text-off-track bg-off-track-light'
    default:
      return 'text-muted-foreground bg-muted'
  }
}

// Get confidence color based on level (1-10)
export function getConfidenceColor(level: number): string {
  if (level >= 7) return 'text-on-track'
  if (level >= 4) return 'text-at-risk'
  return 'text-off-track'
}

// Get confidence background color
export function getConfidenceBgColor(level: number): string {
  if (level >= 7) return 'bg-on-track'
  if (level >= 4) return 'bg-at-risk'
  return 'bg-off-track'
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Get week start date (Monday)
export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get current quarter string (e.g., "Q1 2024")
export function getCurrentTimePeriod(): string {
  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${quarter} ${now.getFullYear()}`
}

// Get all time periods for a year
export function getTimePeriods(year: number = new Date().getFullYear()): string[] {
  return [`Q1 ${year}`, `Q2 ${year}`, `Q3 ${year}`, `Q4 ${year}`]
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Pulse rating emoji mapping
export function getPulseEmoji(rating: number): string {
  const emojis: Record<number, string> = {
    1: '😢',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  }
  return emojis[rating] || '😐'
}

// Pulse rating label mapping
export function getPulseLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Struggling',
    2: 'Challenging',
    3: 'Neutral',
    4: 'Good',
    5: 'Great',
  }
  return labels[rating] || 'Neutral'
}
