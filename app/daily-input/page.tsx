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
  food: string
  activity: string
  other: string
  llm_analysis?: string
  user_id: string
  created_at?: string
}
interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fats: number
}

export default function DailyInputPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [getNutrition, setGetNutrition] = useState<Nutrition | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [existingReport, setExistingReport] = useState<DailyReport | null>(null)

  const currentDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const [formData, setFormData] = useState({
    food: '',
    activity: '',
    other_notes: ''
  })

  // Fetch existing report when date changes
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

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
            console.error('Error fetching report:', error)
          }
          // Clear form data if no existing report
          setFormData({
            food: '',
            activity: '',
            other_notes: ''
          })
          setAnalysisResult(null)
          setExistingReport(null)
          return
        }

        // Populate form with existing data
        setFormData({
          food: data.food || '',
          activity: data.activity || '',
          other_notes: data.other || ''
        })
        setAnalysisResult(data.llm_analysis || null)
        setExistingReport(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to fetch daily report')
      }
    }

    fetchDailyReport()
  }, [selectedDate, supabase])

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
        food: formData.food,
        activity: formData.activity,
        other: formData.other_notes,
        user_id: user.id,
        llm_analysis: analysisResult,
        created_at: new Date().toISOString(),
        nutrition_info: getNutrition
      }

      let error
      if (existingReport) {
        // Update existing report
        const { error: updateError } = await supabase
          .from('daily_info')
          .update(reportData)
          .eq('user_id', user.id)
          .eq('date', selectedDate.toISOString().split('T')[0])
        error = updateError
      } else {
        // Insert new report
        const { error: insertError } = await supabase
          .from('daily_info')
          .insert(reportData)
        error = insertError
      }

      if (error) throw error

      toast.success(existingReport ? 'Report updated successfully!' : 'Daily report submitted successfully!')
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit daily report')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeCalories = async () => {
    setIsAnalyzing(true)
    try {
      const systemPrompt = `You are a nutritionist and fitness expert. Analyze the following daily log and provide:
      1. Estimated total calories consumed
      2. Brief breakdown of major nutrients
      3. Calories burned from activities
      4. Net caloric balance
      Please format your response in a clear, concise way.`

      const userPrompt = `
      Food consumed: ${formData.food}
      Activities: ${formData.activity}
      Additional notes: ${formData.other_notes}
      `

      const systemPromptNutrition = `You are a nutritionist.
      Your job is to take in all of the below information and analyze the nutrition of the food and activity
      You should output the total calories, protein, carbs, and fats
      IT MUST BE A JSON OUTPUT LIKE THIS: {"calories": 2000, "protein": 100, "carbs": 100, "fats": 100, "activity_calories": 500}
      IT HAS TO BE JSON AND ONLY JSON` + userPrompt

      const mockNutritionOutput =  {"calories": 2000, "protein": 100, "carbs": 100, "fats": 100, "activity_calories": 500}
      setGetNutrition(mockNutritionOutput)
      // Here you would make your API call to ChatGPT
      // For now, we'll just show a mock response
      const mockResponse = 'Estimated calories: 2000\nNutrients: Protein, Carbs, Fats\nCalories burned: 500\nNet balance: 1500'
      setAnalysisResult(mockResponse)
      toast.success('Analysis complete!')

    } catch (error) {
      toast.error('Failed to analyze calories')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-start py-10 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-3xl px-4">
        <WeekSlider 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between border-b border-blue-100 pb-4">
            <h1 className="text-2xl font-semibold text-blue-900">Daily Input</h1>
            <span className="text-blue-600">{currentDate}</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="food" className="text-blue-800">Food & Nutrition</Label>
              <Textarea
                id="food"
                value={formData.food}
                onChange={e => setFormData({...formData, food: e.target.value})}
                placeholder="What did you eat today? Include meals, snacks, and drinks..."
                className="min-h-[120px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity" className="text-blue-800">Physical Activity</Label>
              <Textarea
                id="activity"
                value={formData.activity}
                onChange={e => setFormData({...formData, activity: e.target.value})}
                placeholder="What activities did you do? Include exercise, walking, sports..."
                className="min-h-[120px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_notes" className="text-blue-800">Other Notes</Label>
              <Textarea
                id="other_notes"
                value={formData.other_notes}
                onChange={e => setFormData({...formData, other_notes: e.target.value})}
                placeholder="Mental health, special events, sleep quality..."
                className="min-h-[120px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={analyzeCalories}
                disabled={isAnalyzing}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Calories'}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>

            {analysisResult && (
              <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50 text-blue-800">
                <h2 className="text-lg font-medium">Calorie Analysis Result</h2>
                <pre className="whitespace-pre-wrap">{analysisResult}</pre>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 