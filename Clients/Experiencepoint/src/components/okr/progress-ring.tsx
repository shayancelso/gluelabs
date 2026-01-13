'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  className,
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  // Determine color based on progress
  const getColor = () => {
    if (progress >= 70) return '#22C55E' // on-track
    if (progress >= 40) return '#F59E0B' // at-risk
    return '#EF4444' // off-track
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={getColor()}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}
