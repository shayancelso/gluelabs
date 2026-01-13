'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ObjectiveForm } from '@/components/okr/objective-form'

export default function NewObjectivePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Objective</CardTitle>
          <CardDescription>
            Set a clear, inspiring objective that you want to achieve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ObjectiveForm />
        </CardContent>
      </Card>
    </div>
  )
}
