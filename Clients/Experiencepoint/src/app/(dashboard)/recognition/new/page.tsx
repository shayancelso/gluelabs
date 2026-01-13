'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/lib/store'
import { getInitials, cn } from '@/lib/utils'

export default function NewRecognitionPage() {
  const router = useRouter()
  const { addHighFive, currentUser, users, companyValues } = useStore()

  const [receiverId, setReceiverId] = useState('')
  const [message, setMessage] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const otherUsers = users.filter((u) => u.id !== currentUser?.id)

  const toggleValue = (valueId: string) => {
    setSelectedValues((prev) =>
      prev.includes(valueId)
        ? prev.filter((v) => v !== valueId)
        : [...prev, valueId]
    )
  }

  const handleSubmit = async () => {
    if (!currentUser || !receiverId || !message.trim()) return

    setIsSubmitting(true)

    try {
      addHighFive({
        giverId: currentUser.id,
        receiverId,
        message: message.trim(),
        isPublic,
        valueIds: selectedValues,
      })

      router.push('/recognition')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Give High Five</h1>
        <p className="text-muted-foreground">
          Recognize a teammate for their great work.
        </p>
      </div>

      {/* Recipient */}
      <Card>
        <CardHeader>
          <CardTitle>Who do you want to recognize?</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={receiverId} onValueChange={setReceiverId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a teammate" />
            </SelectTrigger>
            <SelectContent>
              {otherUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-xs bg-sun-100 text-sun-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <span className="text-muted-foreground">
                      ({user.jobTitle})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle>What did they do?</CardTitle>
          <CardDescription>
            Be specific about what you&apos;re recognizing them for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Thank you for staying late to help me debug that issue! Your patience and expertise really saved the day."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle>Which values does this represent?</CardTitle>
          <CardDescription>Select one or more company values.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {companyValues.map((value) => (
              <button
                key={value.id}
                type="button"
                onClick={() => toggleValue(value.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all',
                  selectedValues.includes(value.id)
                    ? 'border-sun bg-sun-100'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span>{value.emoji}</span>
                <span className="font-medium">{value.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public">Make this public</Label>
              <p className="text-sm text-muted-foreground">
                Public recognition will appear in the company feed.
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !receiverId || !message.trim()}
        >
          {isSubmitting ? 'Sending...' : 'Send High Five 🙌'}
        </Button>
      </div>
    </div>
  )
}
