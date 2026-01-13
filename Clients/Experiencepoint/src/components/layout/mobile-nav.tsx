'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Target,
  ClipboardCheck,
  Users,
  Heart,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'OKRs', href: '/okrs', icon: Target },
  { name: 'Check-ins', href: '/checkins', icon: ClipboardCheck },
  { name: '1-on-1s', href: '/meetings', icon: Users },
  { name: 'High Fives', href: '/recognition', icon: Heart },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-sun-600'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-sun-600')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
