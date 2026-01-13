'use client'

import { Slider } from '@/components/ui/slider'
import { cn, getConfidenceColor, getConfidenceBgColor } from '@/lib/utils'

interface ConfidenceSliderProps {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ConfidenceSlider({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  size = 'md',
}: ConfidenceSliderProps) {
  const getLabel = (level: number) => {
    if (level >= 7) return 'High'
    if (level >= 4) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Confidence Level</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                getConfidenceBgColor(value),
                'text-white'
              )}
            >
              {value}/10
            </span>
            <span className={cn('text-sm font-medium', getConfidenceColor(value))}>
              {getLabel(value)}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange?.(values[0])}
          min={1}
          max={10}
          step={1}
          disabled={disabled}
          className={cn(
            size === 'sm' && 'h-1',
            size === 'lg' && 'h-3'
          )}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}

// Compact display-only version
export function ConfidenceBadge({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        value >= 7 && 'bg-on-track-light text-on-track',
        value >= 4 && value < 7 && 'bg-at-risk-light text-at-risk',
        value < 4 && 'bg-off-track-light text-off-track',
        className
      )}
    >
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        value >= 7 && 'bg-on-track',
        value >= 4 && value < 7 && 'bg-at-risk',
        value < 4 && 'bg-off-track'
      )} />
      {value}/10
    </div>
  )
}
