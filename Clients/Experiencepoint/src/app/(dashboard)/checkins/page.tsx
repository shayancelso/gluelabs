'use client'

import Link from 'next/link'
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { getWeekStartDate, formatDate, getPulseEmoji, getPulseLabel } from '@/lib/utils'

export default function CheckinsPage() {
  const { weeklyCheckins, currentUser } = useStore()

  const currentWeekStart = getWeekStartDate()
  const hasCurrentCheckin = weeklyCheckins.some(
    (c) =>
      c.authorId === currentUser?.id &&
      new Date(c.weekStartDate).getTime() === currentWeekStart.getTime()
  )

  const myCheckins = weeklyCheckins
    .filter((c) => c.authorId === currentUser?.id)
    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Check-ins</h1>
          <p className="text-muted-foreground">
            Reflect on your week and share updates with your team.
          </p>
        </div>
        {!hasCurrentCheckin && (
          <Button asChild>
            <Link href="/checkins/new">
              <Plus className="h-4 w-4 mr-2" />
              Submit Check-in
            </Link>
          </Button>
        )}
      </div>

      {/* Current Week Status */}
      <Card className={hasCurrentCheckin ? 'border-on-track' : 'border-at-risk'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {hasCurrentCheckin ? (
                  <CheckCircle2 className="h-5 w-5 text-on-track" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-at-risk" />
                )}
                This Week&apos;s Check-in
              </CardTitle>
              <CardDescription>
                Week of {formatDate(currentWeekStart)}
              </CardDescription>
            </div>
            {hasCurrentCheckin ? (
              <Badge variant="success">Submitted</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>
        </CardHeader>
        {!hasCurrentCheckin && (
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Take a few minutes to reflect on your week and share updates.
            </p>
            <Button asChild>
              <Link href="/checkins/new">
                <Plus className="h-4 w-4 mr-2" />
                Submit Check-in
              </Link>
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Past Check-ins */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Check-ins</h2>
        {myCheckins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No check-ins yet. Submit your first check-in to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myCheckins.map((checkin) => (
              <Link key={checkin.id} href={`/checkins/${checkin.id}`}>
                <Card className="hover:border-sun transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {getPulseEmoji(checkin.pulseRating)}
                        </div>
                        <div>
                          <p className="font-medium">
                            Week of {formatDate(checkin.weekStartDate)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Feeling {getPulseLabel(checkin.pulseRating).toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          checkin.status === 'reviewed'
                            ? 'success'
                            : checkin.status === 'submitted'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {checkin.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
