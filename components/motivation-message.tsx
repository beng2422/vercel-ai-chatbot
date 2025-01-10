'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

interface MotivationProps {
  dailyInfo?: {
    food: string
    activity: string
    other_notes: string
  }
}

export function MotivationMessage({ dailyInfo }: MotivationProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    generateMotivation()
  }, [dailyInfo])

  const generateMotivation = async () => {
    try {
      const today = new Date()
      const formattedDate = today.toISOString().split('T')[0]
      
      // First try to fetch today's motivation if it exists
      const { data: existingMotivations, error: fetchError } = await supabase
        .from('daily_motivations')
        .select('message')
        .eq('date', formattedDate)
        .order('created_at', { ascending: false })
        .limit(1)

      if (fetchError) {
        console.error('Error fetching motivation:', fetchError)
      } else if (existingMotivations && existingMotivations.length > 0) {
        setMessage(existingMotivations[0].message)
        setIsLoading(false)
        return
      }

      // If no motivation exists, generate a new one using the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: dailyInfo ? `
            Today's activities:
            Food: ${dailyInfo.food}
            Exercise: ${dailyInfo.activity}
            Notes: ${dailyInfo.other_notes}
          ` : 'New day starting',
          type: 'motivate'
        })
      })

      if (!response.ok) throw new Error('Failed to generate motivation')
      
      const data = await response.json()
      const motivation = data.analysis

      // Save the motivation to Supabase (without unique constraint)
      const { error } = await supabase
        .from('daily_motivations')
        .insert({
          date: formattedDate,
          message: motivation,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      setMessage(motivation)

    } catch (error) {
      console.error('Error generating motivation:', error)
      toast.error('Failed to load motivation message')
      setMessage("Let's make today count! 💪")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading motivation...</div>
  }

  return (
    <div className="flex items-start space-x-4 rounded-lg border bg-white/50 p-4 shadow-sm">
      <div className="relative h-12 w-12 flex-shrink-0">
        <Image
          src="https://api.dicebear.com/7.x/bottts/svg?seed=health-coach"
          alt="AI Coach"
          fill
          className="rounded-full"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">Your AI Coach</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
} 