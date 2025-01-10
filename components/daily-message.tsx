'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface DailyMessageProps {
  dailyInfo?: {
    food: string
    activity: string
    other_notes: string
  }
}

export function DailyMessage({ dailyInfo }: DailyMessageProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLatestMessage()
  }, [])

  const fetchLatestMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: messages, error } = await supabase
        .from('dailyMessage')
        .select('message')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      
      if (messages && messages.length > 0) {
        setMessage(messages[0].message)
      } else {
        generateNewMessage()
      }
    } catch (error) {
      console.error('Error fetching message:', error)
      toast.error('Failed to load daily message')
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewMessage = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get last 3 days of daily info
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      const { data: recentInfo, error: infoError } = await supabase
        .from('daily_info')
        .select('date, llm_analysis, journal, nutrition_info')
        .eq('user_id', user.id)
        .gte('date', threeDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (infoError) {
        console.error('Error fetching recent info:', infoError)
        throw new Error('Failed to fetch recent information')
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            recentInfo: recentInfo || [],
            userProfile: user.user_metadata?.user_current_profile || '',
            userGoals: user.user_metadata?.user_goals || '',
            currentDay: dailyInfo || null
          },
          type: 'daily_message'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate message')
      }
      
      const data = await response.json()
      const newMessage = data.analysis

      const { error: insertError } = await supabase
        .from('dailyMessage')
        .insert({
          user_id: user.id,
          message: newMessage,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError
      setMessage(newMessage)
      toast.success('New daily message generated!')
    } catch (error) {
      console.error('Error generating message:', error)
      toast.error('Failed to generate new message')
      setMessage("Let's make today count! 💪")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading message...</div>
  }

  return (
    <div className="flex flex-col space-y-4 rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src="https://api.dicebear.com/7.x/bottts/svg?seed=health-coach"
            alt="AI Coach"
            fill
            className="rounded-full"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">Your AI Coach</h3>
          <div className="max-h-[200px] overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          onClick={generateNewMessage} 
          disabled={isLoading}
        >
          Generate New Message
        </Button>
        <Button 
          onClick={() => window.location.href = '/coach'}
          variant="secondary"
        >
          Chat with Coach
        </Button>
      </div>
    </div>
  )
} 