'use client'

import Link from 'next/link'
import { Plus, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { getInitials, formatRelativeTime } from '@/lib/utils'

export default function RecognitionPage() {
  const { highFives, companyValues, getUserById, highFiveReactions, currentUser } = useStore()

  // Get public high fives and ones involving current user
  const visibleHighFives = highFives
    .filter(
      (hf) =>
        hf.isPublic ||
        hf.giverId === currentUser?.id ||
        hf.receiverId === currentUser?.id
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recognition</h1>
          <p className="text-muted-foreground">
            Celebrate wins and recognize your teammates.
          </p>
        </div>
        <Button asChild>
          <Link href="/recognition/new">
            <Heart className="h-4 w-4 mr-2" />
            Give High Five
          </Link>
        </Button>
      </div>

      {/* Company Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sun" />
            Company Values
          </CardTitle>
          <CardDescription>
            Use these values when recognizing teammates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {companyValues.map((value) => (
              <Badge
                key={value.id}
                variant="outline"
                className="px-3 py-1 text-sm"
                style={{ borderColor: value.color }}
              >
                <span className="mr-1">{value.emoji}</span>
                {value.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Fives Feed */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recognition Feed</h2>
        {visibleHighFives.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No recognition yet. Be the first to give a high five!
              </p>
              <Button asChild>
                <Link href="/recognition/new">
                  <Heart className="h-4 w-4 mr-2" />
                  Give High Five
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {visibleHighFives.map((highFive) => {
              const giver = getUserById(highFive.giverId)
              const receiver = getUserById(highFive.receiverId)
              const values = companyValues.filter((v) =>
                highFive.valueIds.includes(v.id)
              )
              const reactions = highFiveReactions.filter(
                (r) => r.highFiveId === highFive.id
              )

              return (
                <Card key={highFive.id}>
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={giver?.avatarUrl} />
                        <AvatarFallback className="bg-sun-100 text-sun-700">
                          {giver ? getInitials(giver.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{giver?.name}</span>
                          <span className="text-muted-foreground">gave</span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={receiver?.avatarUrl} />
                            <AvatarFallback className="bg-sun-100 text-sun-700 text-xs">
                              {receiver ? getInitials(receiver.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{receiver?.name}</span>
                          <span className="text-muted-foreground">a high five</span>
                          {!highFive.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>

                        <p className="mb-3">{highFive.message}</p>

                        {values.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {values.map((value) => (
                              <Badge
                                key={value.id}
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: value.color }}
                              >
                                <span className="mr-1">{value.emoji}</span>
                                {value.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {reactions.length > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                {[...new Set(reactions.map((r) => r.emoji))]
                                  .slice(0, 5)
                                  .map((emoji) => (
                                    <span key={emoji}>{emoji}</span>
                                  ))}
                                <span>{reactions.length}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(highFive.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
