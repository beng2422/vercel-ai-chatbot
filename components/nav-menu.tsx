'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function NavMenu() {
  const pathname = usePathname()

  const routes = [
    {
      href: '/',
      label: 'Daily Report',
      active: pathname === '/',
    },
    {
      href: '/daily-input',
      label: 'Enter Daily Info',
      active: pathname === '/daily-input',
    },
    {
      href: '/calendar',
      label: 'Calendar',
      active: pathname === '/calendar',
    },
    {
      href: '/chat',
      label: 'Chat',
      active: pathname === '/chat',
    },
    {
      href: '/goals',
      label: 'Goals',
      active: pathname === '/goals',
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            route.active 
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
} 