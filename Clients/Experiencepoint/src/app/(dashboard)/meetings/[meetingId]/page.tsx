'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Calendar, Clock, User, CheckSquare, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { getInitials, formatDate } from '@/lib/utils'

interface PageProps {
  params: { meetingId: string }
}

export default function MeetingDetailPage({ params }: PageProps) {
  const { meetingId } = params
  const {
    meetings,
    agendaItems,
    actionItems,
    getUserById,
    addAgendaItem,
    updateAgendaItem,
    addActionItem,
    updateActionItem,
    currentUser,
  } = useStore()

  const [newAgendaItem, setNewAgendaItem] = useState('')
  const [newActionItem, setNewActionItem] = useState('')
  const [notes, setNotes] = useState('')

  const meeting = meetings.find((m) => m.id === meetingId)

  if (!meeting) {
    notFound()
  }

  const host = getUserById(meeting.hostId)
  const participant = getUserById(meeting.participantId)
  const meetingAgendaItems = agendaItems.filter((a) => a.meetingId === meetingId)
  const meetingActionItems = actionItems.filter((a) => a.meetingId === meetingId)

  const handleAddAgendaItem = () => {
    if (!newAgendaItem.trim() || !currentUser) return
    addAgendaItem({
      meetingId,
      createdById: currentUser.id,
      content: newAgendaItem,
      sortOrder: meetingAgendaItems.length,
      isDiscussed: false,
    })
    setNewAgendaItem('')
  }

  const handleAddActionItem = () => {
    if (!newActionItem.trim() || !currentUser || !participant) return
    addActionItem({
      meetingId,
      assigneeId: participant.id,
      createdById: currentUser.id,
      content: newActionItem,
      isCompleted: false,
    })
    setNewActionItem('')
  }

  const toggleAgendaItem = (id: string, isDiscussed: boolean) => {
    updateAgendaItem(id, { isDiscussed })
  }

  const toggleActionItem = (id: string, isCompleted: boolean) => {
    updateActionItem(id, { isCompleted, completedAt: isCompleted ? new Date() : undefined })
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/meetings">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meetings
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Meeting Info */}
            <div className="flex-1 min-w-0 space-y-4">
              <h1 className="text-2xl font-bold">{meeting.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(meeting.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{meeting.duration} minutes</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-4 pt-4 border-t">
                {host && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={host.avatarUrl} />
                      <AvatarFallback className="bg-sun-100 text-sun-700">
                        {getInitials(host.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{host.name}</p>
                      <p className="text-sm text-muted-foreground">Host</p>
                    </div>
                  </div>
                )}
                <div className="text-muted-foreground">with</div>
                {participant && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.avatarUrl} />
                      <AvatarFallback className="bg-sun-100 text-sun-700">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.jobTitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Agenda
          </CardTitle>
          <CardDescription>Topics to discuss during the meeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetingAgendaItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agenda items yet. Add topics to discuss.</p>
          ) : (
            <ul className="space-y-2">
              {meetingAgendaItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={item.isDiscussed}
                    onCheckedChange={(checked) => toggleAgendaItem(item.id, !!checked)}
                  />
                  <span className={item.isDiscussed ? 'line-through text-muted-foreground' : ''}>
                    {item.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Add agenda item..."
              value={newAgendaItem}
              onChange={(e) => setNewAgendaItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAgendaItem()}
            />
            <Button onClick={handleAddAgendaItem} disabled={!newAgendaItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Action Items
          </CardTitle>
          <CardDescription>Tasks assigned from this meeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetingActionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No action items yet.</p>
          ) : (
            <ul className="space-y-2">
              {meetingActionItems.map((item) => {
                const assignee = getUserById(item.assigneeId)
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={item.isCompleted}
                      onCheckedChange={(checked) => toggleActionItem(item.id, !!checked)}
                    />
                    <span className={item.isCompleted ? 'line-through text-muted-foreground' : ''}>
                      {item.content}
                    </span>
                    {assignee && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        Assigned to {assignee.name}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Add action item..."
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
            />
            <Button onClick={handleAddActionItem} disabled={!newActionItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shared Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Notes</CardTitle>
          <CardDescription>Notes visible to both participants</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add meeting notes..."
            value={meeting.sharedNotes || notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Meta info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created {formatDate(meeting.createdAt)}</span>
            <span>Last updated {formatDate(meeting.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
