'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { WeekSlider } from '@/app/components/week-slider'
import { MotivationMessage } from '@/components/motivation-message'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface DailyReport {
  date: string
  food: string
  activity: string
  other: string
  llm_analysis?: string
  nutrition_info?: any
  user_id: string
  created_at?: string
}

export default function DailyReportPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [report, setReport] = useState<DailyReport | null>(null)

  const currentDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('daily_info')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate.toISOString().split('T')[0])
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching report:', error)
        }
        setReport(data || null)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchDailyReport()
  }, [selectedDate, supabase])

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-start py-10">
      <div className="w-full max-w-3xl px-4">
        <MotivationMessage dailyInfo={report || undefined} />
        
        <div className="mt-6">
          <WeekSlider 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          
          <div className="rounded-lg border bg-background p-8">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <h1 className="text-2xl font-bold">Daily Report</h1>
              <span className="text-muted-foreground">{currentDate}</span>
            </div>

            {report ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold mb-2">Food & Nutrition</h2>
                  <p className="text-muted-foreground">{report.food}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Physical Activity</h2>
                  <p className="text-muted-foreground">{report.activity}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Other Notes</h2>
                  <p className="text-muted-foreground">{report.other}</p>
                </div>
                {report.llm_analysis && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h2 className="font-semibold mb-2">Analysis</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{report.llm_analysis}</p>
                  </div>
                )}
                <Button 
                  onClick={() => router.push(`/daily-input?date=${selectedDate.toISOString()}`)}
                >
                  Edit Report
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No report for this date</p>
                <Button 
                  onClick={() => router.push(`/daily-input?date=${selectedDate.toISOString()}`)}
                >
                  Create Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 