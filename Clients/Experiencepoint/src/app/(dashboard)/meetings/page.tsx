'use client'

import Link from 'next/link'
import { Plus, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { getInitials, formatDate } from '@/lib/utils'

export default function MeetingsPage() {
  const { meetings, currentUser, getUserById } = useStore()

  const myMeetings = meetings
    .filter(
      (m) =>
        m.hostId === currentUser?.id || m.participantId === currentUser?.id
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    )

  const upcomingMeetings = myMeetings.filter(
    (m) => m.status === 'scheduled' && new Date(m.scheduledAt) > new Date()
  )
  const pastMeetings = myMeetings.filter(
    (m) => m.status === 'completed' || new Date(m.scheduledAt) <= new Date()
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">1-on-1 Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage your one-on-one meetings.
          </p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Link>
        </Button>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No upcoming meetings scheduled.
              </p>
              <Button asChild>
                <Link href="/meetings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingMeetings.map((meeting) => {
              const otherPerson =
                meeting.hostId === currentUser?.id
                  ? getUserById(meeting.participantId)
                  : getUserById(meeting.hostId)

              return (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <Card className="hover:border-sun transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={otherPerson?.avatarUrl} />
                          <AvatarFallback className="bg-sun-100 text-sun-700">
                            {otherPerson ? getInitials(otherPerson.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{meeting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            with {otherPerson?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatDate(meeting.scheduledAt)}
                          </p>
                          <Badge variant="secondary">{meeting.duration} min</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Meetings</h2>
        {pastMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No past meetings yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastMeetings.slice(0, 5).map((meeting) => {
              const otherPerson =
                meeting.hostId === currentUser?.id
                  ? getUserById(meeting.participantId)
                  : getUserById(meeting.hostId)

              return (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <Card className="hover:border-sun transition-colors">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherPerson?.avatarUrl} />
                          <AvatarFallback className="bg-sun-100 text-sun-700 text-xs">
                            {otherPerson ? getInitials(otherPerson.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {meeting.title}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(meeting.scheduledAt)}
                        </p>
                        <Badge
                          variant={
                            meeting.status === 'completed' ? 'success' : 'secondary'
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
