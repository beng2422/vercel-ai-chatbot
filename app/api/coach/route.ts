import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  // Get user's recent daily inputs and goals
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get recent daily info
  const { data: recentInfo } = await supabase
    .from('daily_info')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false })
    .limit(3)

  // Get health goals
  const { data: healthGoals } = await supabase
    .from('health_goals')
    .select('*')
    .eq('user_id', user?.id)

  const userContext = {
    recentActivities: recentInfo || [],
    goals: {
      healthGoals: healthGoals || [],
      personalGoals: user?.user_metadata?.user_goals || ''
    },
    profile: user?.user_metadata?.user_current_profile || ''
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a supportive AI health coach. Use this context about the user:
        Recent Activities: ${JSON.stringify(userContext.recentActivities)}
        Goals: ${JSON.stringify(userContext.goals)}
        Profile: ${userContext.profile}
        
        Be encouraging but honest, and reference their specific goals and activities.`
      },
      ...messages
    ]
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)

  // Return a StreamingTextResponse, which sets the correct headers
  return new StreamingTextResponse(stream)
}