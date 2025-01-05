'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  user_id: string
  height: number
  weight: number
  target_weight: number
  age: number
  gender: string
  activity_level: string
  created_at: string
  updated_at: string
}

interface HealthGoal {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  target_date?: string
  created_at: string
  updated_at: string
}

const SUGGESTED_GOALS = [
  {
    title: 'Weight Management',
    description: 'Reach and maintain a healthy weight of [target] lbs',
    category: 'weight'
  },
  {
    title: 'Strength Training',
    description: 'Build muscle mass and increase strength through regular weight training',
    category: 'strength'
  },
  {
    title: 'Cardiovascular Health',
    description: 'Improve cardiovascular endurance through regular cardio exercises',
    category: 'cardio'
  },
  {
    title: 'Flexibility',
    description: 'Enhance flexibility and mobility through stretching and yoga',
    category: 'flexibility'
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [goals, setGoals] = useState<HealthGoal[]>([])
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null)

  const [profileForm, setProfileForm] = useState({
    height: '',
    weight: '',
    target_weight: '',
    age: '',
    gender: '',
    activity_level: ''
  })

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    target_date: ''
  })

  useEffect(() => {
    fetchUserProfile()
    fetchGoals()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to view your profile')
        router.push('/sign-in')
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (profile) {
        setProfile(profile)
        setProfileForm({
          height: profile.height.toString(),
          weight: profile.weight.toString(),
          target_weight: profile.target_weight.toString(),
          age: profile.age.toString(),
          gender: profile.gender,
          activity_level: profile.activity_level
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to fetch profile')
    }
  }

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: goals, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(goals)
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to fetch goals')
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to update your profile')
        router.push('/sign-in')
        return
      }

      const profileData = {
        user_id: user.id,
        height: parseFloat(profileForm.height),
        weight: parseFloat(profileForm.weight),
        target_weight: parseFloat(profileForm.target_weight),
        age: parseInt(profileForm.age),
        gender: profileForm.gender,
        activity_level: profileForm.activity_level,
        updated_at: new Date().toISOString()
      }

      const { error } = profile
        ? await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', user.id)
        : await supabase
            .from('user_profiles')
            .insert({ ...profileData, created_at: new Date().toISOString() })

      if (error) throw error
      toast.success('Profile updated successfully!')
      fetchUserProfile()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // ... Rest of the component (goal handling functions and JSX) follows similar pattern to the original goals page
  // but with updated fields and sections for both profile and goals

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-start py-10">
      <div className="w-full max-w-3xl px-4">
        {/* Profile Section */}
        <div className="rounded-lg border bg-background p-8 mb-8">
          <h1 className="mb-6 text-2xl font-semibold">Your Profile</h1>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profileForm.height}
                  onChange={e => setProfileForm({...profileForm, height: e.target.value})}
                  placeholder="Height in cm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profileForm.weight}
                  onChange={e => setProfileForm({...profileForm, weight: e.target.value})}
                  placeholder="Weight in kg"
                  required
                />
              </div>
              {/* Add other profile fields similarly */}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </div>

        {/* Goals Section */}
        {/* Similar to original goals section but with suggested goals and categories */}
      </div>
    </div>
  )
}