'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { getInitials } from '@/lib/utils'
import { User, Building2, Users, Palette, Bell } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { currentUser } = useStore()

  const settingsSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information',
      icon: User,
      href: '/settings/profile',
    },
    {
      title: 'Organization',
      description: 'Company settings and branding',
      icon: Building2,
      href: '/settings/organization',
    },
    {
      title: 'Teams',
      description: 'Manage teams and departments',
      icon: Users,
      href: '/settings/teams',
    },
    {
      title: 'Appearance',
      description: 'Theme and display preferences',
      icon: Palette,
      href: '/settings/appearance',
    },
    {
      title: 'Notifications',
      description: 'Email and push notification settings',
      icon: Bell,
      href: '/settings/notifications',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings.
        </p>
      </div>

      {/* Current User Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.avatarUrl} />
              <AvatarFallback className="bg-sun-100 text-sun-700 text-xl">
                {currentUser ? getInitials(currentUser.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
              <p className="text-muted-foreground">{currentUser?.email}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {currentUser?.role} • {currentUser?.jobTitle}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className="hover:border-sun transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-sun-100">
                    <section.icon className="h-5 w-5 text-sun-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset All Data</p>
              <p className="text-sm text-muted-foreground">
                Clear all locally stored data
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure? This will clear all your data.')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
            >
              Reset Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
