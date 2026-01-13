'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Filter, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ObjectiveCard } from '@/components/okr/objective-card'
import { useStore } from '@/lib/store'
import { getCurrentTimePeriod, getTimePeriods } from '@/lib/utils'
import type { ObjectiveLevel, ObjectiveStatus } from '@/lib/types'

export default function OKRsPage() {
  const { objectives, keyResults, currentUser, getKeyResultsByObjectiveId } = useStore()

  const [timePeriod, setTimePeriod] = useState(getCurrentTimePeriod())
  const [levelFilter, setLevelFilter] = useState<ObjectiveLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter objectives
  const filteredObjectives = objectives.filter((obj) => {
    if (obj.timePeriod !== timePeriod) return false
    if (levelFilter !== 'all' && obj.level !== levelFilter) return false
    if (statusFilter !== 'all' && obj.status !== statusFilter) return false
    return true
  })

  // Separate by ownership
  const myObjectives = filteredObjectives.filter((obj) => obj.ownerId === currentUser?.id)
  const teamObjectives = filteredObjectives.filter((obj) => obj.ownerId !== currentUser?.id)

  const currentYear = new Date().getFullYear()
  const timePeriods = [
    ...getTimePeriods(currentYear),
    ...getTimePeriods(currentYear + 1),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OKRs</h1>
          <p className="text-muted-foreground">
            Track objectives and key results across your organization.
          </p>
        </div>
        <Button asChild>
          <Link href="/okrs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Objective
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as ObjectiveLevel | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="company">🏢 Company</SelectItem>
            <SelectItem value="department">🏛️ Department</SelectItem>
            <SelectItem value="team">👥 Team</SelectItem>
            <SelectItem value="individual">👤 Individual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ObjectiveStatus | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="my" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my">
            My OKRs ({myObjectives.length})
          </TabsTrigger>
          <TabsTrigger value="team">
            Team OKRs ({teamObjectives.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All OKRs ({filteredObjectives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          {myObjectives.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No objectives yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first objective to get started.
              </p>
              <Button asChild>
                <Link href="/okrs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Objective
                </Link>
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
              {myObjectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  keyResults={getKeyResultsByObjectiveId(objective.id)}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {teamObjectives.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No team objectives</h3>
              <p className="text-muted-foreground">
                No one else has created objectives for this period yet.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
              {teamObjectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  keyResults={getKeyResultsByObjectiveId(objective.id)}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredObjectives.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No objectives found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
              {filteredObjectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  keyResults={getKeyResultsByObjectiveId(objective.id)}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
