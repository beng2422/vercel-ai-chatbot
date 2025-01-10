'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

export default function GoalsPage() {
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [goals, setGoals] = useState('')
  const [currentProfile, setCurrentProfile] = useState('')

  useEffect(() => {
    fetchUserMetadata()
  }, [])

  const fetchUserMetadata = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setGoals(user.user_metadata.user_goals || '')
      setCurrentProfile(user.user_metadata.user_current_profile || '')
    } catch (error) {
      console.error('Error fetching user metadata:', error)
      toast.error('Failed to fetch user information')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { error } = await supabase.auth.updateUser({
        data: {
          user_goals: goals,
          user_current_profile: currentProfile
        }
      })

      if (error) throw error
      toast.success('Information updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update information')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-start py-10">
      <div className="w-full max-w-3xl px-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-lg border bg-background p-8">
            <h2 className="text-2xl font-semibold mb-4">Your Current Profile</h2>
            <Textarea
              value={currentProfile}
              onChange={(e) => setCurrentProfile(e.target.value)}
              placeholder="Describe your current fitness profile..."
              className="min-h-[150px] text-white placeholder:text-gray-400"
            />
          </div>

          <div className="rounded-lg border bg-background p-8">
            <h2 className="text-2xl font-semibold mb-4">Your Goals</h2>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Describe your fitness goals..."
              className="min-h-[150px] text-white placeholder:text-gray-400"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}