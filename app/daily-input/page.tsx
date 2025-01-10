'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { WeekSlider } from '@/app/components/week-slider'

interface DailyReport {
  date: string
  journal: string
  llm_analysis?: string
  nutrition_info?: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  user_id: string
  created_at?: string
}

export default function DailyInputPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [existingReport, setExistingReport] = useState<DailyReport | null>(null)
  const [journalEntry, setJournalEntry] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [nutritionInfo, setNutritionInfo] = useState<DailyReport['nutrition_info']>()
  const [userProfile, setUserProfile] = useState('')
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([])
  const [newMessage, setNewMessage] = useState('')

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
        
        setJournalEntry(data?.journal || '')
        setExistingReport(data || null)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to fetch daily report')
      }
    }

    fetchDailyReport()
  }, [selectedDate, supabase])

  useEffect(() => {
    fetchUserProfile()
    fetchExistingReport()
  }, [selectedDate])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserProfile(user.user_metadata.user_current_profile || '')
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchExistingReport = async () => {
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
      
      if (data) {
        setExistingReport(data)
        setJournalEntry(data.journal || '')
        setAnalysisResult(data.llm_analysis || '')
        setNutritionInfo(data.nutrition_info || null)
        if (data.llm_analysis) {
          setConversation([
            { role: 'system', content: 'Analysis complete. You can ask questions about the analysis or request adjustments to the nutrition estimates.' },
            { role: 'assistant', content: data.llm_analysis }
          ])
        }
      } else {
        setExistingReport(null)
        setJournalEntry('')
        setAnalysisResult('')
        setNutritionInfo(undefined)
        setConversation([])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch daily report')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to submit a report')
        router.push('/sign-in')
        return
      }

      const reportData = {
        date: selectedDate.toISOString().split('T')[0],
        journal: journalEntry,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      let error
      if (existingReport) {
        const { error: updateError } = await supabase
          .from('daily_info')
          .update(reportData)
          .eq('user_id', user.id)
          .eq('date', selectedDate.toISOString().split('T')[0])
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('daily_info')
          .insert(reportData)
        error = insertError
      }

      if (error) throw error

      toast.success(existingReport ? 'Journal updated!' : 'Journal entry saved!')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save journal entry')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeEntry = async () => {
    if (!journalEntry.trim()) {
      toast.error('Please write your journal entry first')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: journalEntry,
          type: 'analyze',
          userProfile: userProfile
        })
      })

      if (!response.ok) throw new Error('Analysis failed')
      
      const data = await response.json()
      const { analysis, nutrition } = data

      // Save to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: updateError } = await supabase
          .from('daily_info')
          .update({
            llm_analysis: analysis,
            nutrition_info: nutrition
          })
          .eq('user_id', user.id)
          .eq('date', selectedDate.toISOString().split('T')[0])

        if (updateError) throw updateError
      }

      setAnalysisResult(analysis)
      setNutritionInfo(nutrition)
      setConversation([
        { role: 'system', content: 'Analysis complete. You can ask questions about the analysis or request adjustments to the nutrition estimates.' },
        { role: 'assistant', content: analysis }
      ])
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to analyze entry')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const updatedConversation = [
      ...conversation,
      { role: 'user', content: newMessage }
    ]
    setConversation(updatedConversation)
    setNewMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          type: 'conversation',
          context: {
            journal: journalEntry,
            analysis: analysisResult,
            nutrition: nutritionInfo,
            userProfile: userProfile,
            conversation: updatedConversation
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()

      setConversation([...updatedConversation, { role: 'assistant', content: data.analysis }])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-start py-10 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-3xl px-4">
        <div className="mt-6">
          <WeekSlider 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <div className="rounded-lg border bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between border-b border-blue-100 pb-4">
              <h1 className="text-2xl font-semibold text-blue-900">Daily Journal</h1>
              <span className="text-blue-600">{currentDate}</span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="journal" className="text-blue-800">Today's Entry</Label>
                <Textarea
                  id="journal"
                  value={journalEntry}
                  onChange={e => setJournalEntry(e.target.value)}
                  placeholder="Write about your day... Include your meals, activities, thoughts, and feelings."
                  className="min-h-[300px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="button"
                  onClick={analyzeEntry}
                  disabled={isAnalyzing || !journalEntry}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Entry'}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {analysisResult && (
        <div className="mt-6 space-y-4 w-full max-w-3xl">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800 mb-2">Analysis</h2>
            <p className="text-green-700 whitespace-pre-wrap">{analysisResult}</p>
          </div>
          {nutritionInfo && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-blue-800 mb-2">Nutrition Estimates</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-600">Calories: {nutritionInfo.calories}</p>
                  <p className="text-blue-600">Protein: {nutritionInfo.protein}g</p>
                </div>
                <div>
                  <p className="text-blue-600">Carbs: {nutritionInfo.carbs}g</p>
                  <p className="text-blue-600">Fats: {nutritionInfo.fats}g</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold mb-4">Conversation</h2>
            <div className="space-y-4 mb-4">
              {conversation.map((msg, i) => (
                <div key={i} className={`p-2 rounded ${
                  msg.role === 'user' ? 'bg-blue-50 ml-8' : 
                  msg.role === 'assistant' ? 'bg-green-50 mr-8' : 'bg-gray-50'
                }`}>
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask a question about the analysis..."
                className="flex-1"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 