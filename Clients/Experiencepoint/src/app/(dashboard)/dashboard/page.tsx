'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Target,
  TrendingUp,
  Clock,
  Heart,
  ChevronRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { getInitials, formatProgress, getCurrentTimePeriod, getConfidenceColor } from '@/lib/utils'

export default function DashboardPage() {
  const { currentUser, objectives, keyResults, users, getUserById } = useStore()
  const currentPeriod = getCurrentTimePeriod()

  // Get user's objectives for current period
  const myObjectives = objectives.filter(
    (obj) => obj.ownerId === currentUser?.id && obj.timePeriod === currentPeriod && obj.status === 'active'
  )

  // Get all active objectives for the organization
  const activeObjectives = objectives.filter(
    (obj) => obj.timePeriod === currentPeriod && obj.status === 'active'
  )

  // Calculate stats
  const avgProgress = activeObjectives.length > 0
    ? Math.round(activeObjectives.reduce((acc, obj) => acc + obj.progress, 0) / activeObjectives.length)
    : 0

  const onTrackCount = activeObjectives.filter((obj) => obj.progress >= 70).length
  const atRiskCount = activeObjectives.filter((obj) => obj.progress >= 40 && obj.progress < 70).length
  const offTrackCount = activeObjectives.filter((obj) => obj.progress < 40).length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s how your team is tracking against {currentPeriod} goals.
          </p>
        </div>
        <Button asChild>
          <Link href="/okrs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Objective
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {activeObjectives.length} active objectives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <TrendingUp className="h-4 w-4 text-on-track" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-on-track">{onTrackCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              objectives performing well
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Clock className="h-4 w-4 text-at-risk" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-at-risk">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              objectives need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Off Track</CardTitle>
            <Target className="h-4 w-4 text-off-track" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-off-track">{offTrackCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              objectives falling behind
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My OKRs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My OKRs</CardTitle>
              <CardDescription>Your objectives for {currentPeriod}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/okrs">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myObjectives.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any objectives for this quarter yet.
                </p>
                <Button asChild>
                  <Link href="/okrs/new">Create your first OKR</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myObjectives.slice(0, 3).map((objective) => {
                  const objectiveKRs = keyResults.filter((kr) => kr.objectiveId === objective.id)
                  return (
                    <Link
                      key={objective.id}
                      href={`/okrs/${objective.id}`}
                      className="block p-4 rounded-lg border hover:border-sun transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                objective.level === 'company'
                                  ? 'default'
                                  : objective.level === 'team'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {objective.level}
                            </Badge>
                            <span className={`text-xs font-medium ${getConfidenceColor(objective.confidenceLevel)}`}>
                              {objective.confidenceLevel}/10 confidence
                            </span>
                          </div>
                          <h4 className="font-medium truncate">{objective.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {objectiveKRs.length} key results
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatProgress(objective.progress)}</div>
                          <Progress
                            value={objective.progress}
                            className="w-24 mt-1"
                            indicatorClassName={
                              objective.progress >= 70
                                ? 'bg-on-track'
                                : objective.progress >= 40
                                ? 'bg-at-risk'
                                : 'bg-off-track'
                            }
                          />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company OKRs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Company OKRs</CardTitle>
              <CardDescription>Organization-wide objectives</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/okrs/company">
                View tree
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeObjectives
                .filter((obj) => obj.level === 'company')
                .slice(0, 3)
                .map((objective) => {
                  const owner = getUserById(objective.ownerId)
                  return (
                    <Link
                      key={objective.id}
                      href={`/okrs/${objective.id}`}
                      className="block p-4 rounded-lg border hover:border-sun transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={owner?.avatarUrl} />
                          <AvatarFallback className="bg-sun-100 text-sun-700 text-xs">
                            {owner ? getInitials(owner.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{objective.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Owned by {owner?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatProgress(objective.progress)}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link href="/checkins/new">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sun-100">
                      <Clock className="h-5 w-5 text-sun-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Submit Check-in</div>
                      <div className="text-xs text-muted-foreground">Weekly reflection</div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link href="/recognition/new">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Give High Five</div>
                      <div className="text-xs text-muted-foreground">Recognize a teammate</div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link href="/okrs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Update Progress</div>
                      <div className="text-xs text-muted-foreground">Check-in on OKRs</div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link href="/meetings/new">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Schedule 1-on-1</div>
                      <div className="text-xs text-muted-foreground">Book a meeting</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>People in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => {
                const userObjectives = objectives.filter(
                  (obj) => obj.ownerId === user.id && obj.timePeriod === currentPeriod && obj.status === 'active'
                )
                const avgProgress = userObjectives.length > 0
                  ? Math.round(userObjectives.reduce((acc, obj) => acc + obj.progress, 0) / userObjectives.length)
                  : 0

                return (
                  <div key={user.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="bg-sun-100 text-sun-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatProgress(avgProgress)}</div>
                      <div className="text-xs text-muted-foreground">
                        {userObjectives.length} OKRs
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
