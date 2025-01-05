'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Header component
const HeaderComponent = dynamic(
  () => import('./header').then((mod) => ({ default: mod.Header })),
  {
    loading: () => (
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
        <div className="animate-pulse h-8 w-8 bg-muted rounded" />
      </header>
    ),
    ssr: false
  }
)

export function HeaderWrapper() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
        <div className="animate-pulse h-8 w-8 bg-muted rounded" />
      </header>
    }>
      <HeaderComponent />
    </Suspense>
  )
} 