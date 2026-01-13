'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { getCurrentTimePeriod } from '@/lib/utils'

export default function AnalyticsPage() {
  const { objectives, keyResults, weeklyCheckins, highFives } = useStore()
  const currentPeriod = getCurrentTimePeriod()

  // Calculate stats
  const activeObjectives = objectives.filter(
    (obj) => obj.timePeriod === currentPeriod && obj.status === 'active'
  )
  const completedObjectives = objectives.filter(
    (obj) => obj.timePeriod === currentPeriod && obj.status === 'completed'
  )

  const totalObjectives = activeObjectives.length + completedObjectives.length
  const completionRate = totalObjectives > 0
    ? Math.round((completedObjectives.length / totalObjectives) * 100)
    : 0

  const avgProgress = activeObjectives.length > 0
    ? Math.round(activeObjectives.reduce((acc, obj) => acc + obj.progress, 0) / activeObjectives.length)
    : 0

  const onTrackCount = activeObjectives.filter((obj) => obj.progress >= 70).length
  const atRiskCount = activeObjectives.filter((obj) => obj.progress >= 40 && obj.progress < 70).length
  const offTrackCount = activeObjectives.filter((obj) => obj.progress < 40).length

  // Key Result stats
  const activeKRs = keyResults.filter((kr) =>
    activeObjectives.some((obj) => obj.id === kr.objectiveId)
  )
  const completedKRs = activeKRs.filter((kr) => kr.status === 'completed')
  const krCompletionRate = activeKRs.length > 0
    ? Math.round((completedKRs.length / activeKRs.length) * 100)
    : 0

  // Pulse stats
  const recentCheckins = weeklyCheckins.slice(-20)
  const avgPulse = recentCheckins.length > 0
    ? (recentCheckins.reduce((acc, c) => acc + c.pulseRating, 0) / recentCheckins.length).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance metrics across your organization.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average OKR Progress</CardDescription>
            <CardTitle className="text-3xl">{avgProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Objectives Completed</CardDescription>
            <CardTitle className="text-3xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {completedObjectives.length} of {totalObjectives} objectives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Key Results Completed</CardDescription>
            <CardTitle className="text-3xl">{krCompletionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {completedKRs.length} of {activeKRs.length} key results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Pulse Rating</CardDescription>
            <CardTitle className="text-3xl">{avgPulse}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Based on {recentCheckins.length} check-ins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OKR Health */}
      <Card>
        <CardHeader>
          <CardTitle>OKR Health Overview</CardTitle>
          <CardDescription>
            Status breakdown for {currentPeriod}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-on-track mb-2">
                {onTrackCount}
              </div>
              <div className="text-sm text-muted-foreground">On Track</div>
              <Progress
                value={(onTrackCount / Math.max(activeObjectives.length, 1)) * 100}
                className="h-2 mt-2"
                indicatorClassName="bg-on-track"
              />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-at-risk mb-2">
                {atRiskCount}
              </div>
              <div className="text-sm text-muted-foreground">At Risk</div>
              <Progress
                value={(atRiskCount / Math.max(activeObjectives.length, 1)) * 100}
                className="h-2 mt-2"
                indicatorClassName="bg-at-risk"
              />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-off-track mb-2">
                {offTrackCount}
              </div>
              <div className="text-sm text-muted-foreground">Off Track</div>
              <Progress
                value={(offTrackCount / Math.max(activeObjectives.length, 1)) * 100}
                className="h-2 mt-2"
                indicatorClassName="bg-off-track"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check-in Activity</CardTitle>
            <CardDescription>Weekly submission rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold mb-2">
                {weeklyCheckins.length}
              </div>
              <p className="text-muted-foreground">Total check-ins submitted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recognition Activity</CardTitle>
            <CardDescription>High fives given</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold mb-2">
                {highFives.length}
              </div>
              <p className="text-muted-foreground">High fives given</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
