'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MotivationMessage } from '@/components/motivation-message'
import { ActivityGraph } from '@/components/activity-graph'
import { TaskDistributionChart } from '@/components/task-distribution-chart'

export default function HomePage() {
  const [dailyInfo, setDailyInfo] = useState<{
    food: string;
    activity: string;
    other: string;
  } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchTodayInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('daily_info')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        setDailyInfo(data)
      } catch (error) {
        console.error('Error fetching today\'s info:', error)
      }
    }

    fetchTodayInfo()
  }, [supabase])

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <MotivationMessage 
            dailyInfo={dailyInfo ? {
              food: dailyInfo.food ? dailyInfo.food : '',
              activity: dailyInfo.activity ? dailyInfo.activity : '',
              other_notes: dailyInfo.other ? dailyInfo.other : ''
            } : undefined}
          />
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Daily Report Dashboard</h1>
          <p className="text-lg text-gray-600">
            Track your progress and manage your daily activities
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Activity Overview</h2>
            <ActivityGraph />
          </div>
          
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Task Distribution</h2>
            <TaskDistributionChart />
          </div>
          
          <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Quick Stats</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">Tasks Completed</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">24</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-600">Goals Achieved</p>
                <p className="mt-2 text-3xl font-bold text-green-700">8</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-600">Streak Days</p>
                <p className="mt-2 text-3xl font-bold text-purple-700">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
