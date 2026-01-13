'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { Database, User } from 'lucide-react'

export function SampleDataLoader() {
  const [open, setOpen] = useState(false)
  const { loadSampleData, currentUser } = useStore()

  const handleLoadData = () => {
    loadSampleData('natalie')
    setOpen(false)
  }

  const isNatalieLoaded = currentUser?.id === 'user-natalie'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isNatalieLoaded ? 'Demo Mode' : 'Load Demo'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Sample Data</DialogTitle>
          <DialogDescription>
            Experience the platform as a Director of People Ops with pre-populated data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-sun-50">
            <div className="h-12 w-12 rounded-full bg-sun flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="font-semibold">Natalie Fleming</p>
              <p className="text-sm text-muted-foreground">Director of People Ops</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>This will load:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>3 People Ops objectives with 8 key results</li>
              <li>2 weekly check-ins with responses</li>
              <li>3 upcoming 1-on-1 meetings</li>
              <li>3 high fives (given and received)</li>
              <li>2 direct reports (Marcus & Sophie)</li>
            </ul>
          </div>

          {isNatalieLoaded && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              Demo data is already loaded. Click below to refresh.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLoadData}>
            {isNatalieLoaded ? 'Reload Demo Data' : 'Load Demo Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
