'use client'

import { Chat } from '@/components/chat'
import { nanoid } from '@/lib/utils'

export default function CoachPage() {
  const id = nanoid()

  return (
    <div className="flex min-h-screen flex-col">
      <Chat id={id} />
    </div>
  )
} 