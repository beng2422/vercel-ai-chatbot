import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const { content, type, userProfile, context } = await req.json()

  let systemPrompt = ''
  if (type === 'daily_message') {
    systemPrompt = `You are a supportive health coach. Based on the user's profile and recent activities, provide two short sections:
    1. Progress Analysis: Briefly analyze if they're moving towards their goals
    2. Suggestions: One specific suggestion for improvement
    
    Keep each section to 1-2 sentences maximum. Be very short. Be encouraging but specific.
    BE BRUTALLY HONEST, IF THE USER IS NOT DOING SOMETHING GOOD TELL THEM`
  } else if (type === 'analyze') {
    systemPrompt = `You are a health and nutrition expert. Using the following user profile information:
    ${content.userProfile || 'No profile available'}
    
    Analyze the following journal entry and provide:
    1. A brief analysis of their day considering their profile
    2. Estimated calories consumed and burned based on their profile
    3. Suggestions for improvement
    Format the response in clear sections.
    Also provide a JSON object with nutrition estimates in this format:
    {"calories": number, "protein": number, "carbs": number, "fats": number}`
  } else if (type === 'conversation') {
    systemPrompt = `You are a health and nutrition expert. Use the following context to help answer questions and adjust nutrition estimates:
    User Profile: ${context?.userProfile || 'No profile available'}
    Journal Entry: ${context?.journal || ''}
    Previous Analysis: ${context?.analysis || ''}
    Current Nutrition Estimates: ${JSON.stringify(context?.nutrition || {})}
    
    Provide detailed, helpful responses and update nutrition estimates if requested.`
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: type === 'daily_message' 
            ? JSON.stringify({
                recentActivities: content.recentInfo,
                profile: content.userProfile,
                goals: content.userGoals,
                today: content.currentDay
              })
            : type === 'analyze'
            ? content.journalEntry
            : content
        }
      ],
      temperature: 0.7,
      stream: false
    })

    const analysisText = response.choices[0].message.content || ''
    let nutritionInfo = null

    if (type === 'analyze') {
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionInfo = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Failed to parse nutrition info:', error);
      }
    }

    return Response.json({
      analysis: analysisText,
      nutrition: nutritionInfo
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return Response.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}