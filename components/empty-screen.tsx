import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Ask about your progress',
    message: `How am I doing with my fitness goals?`
  },
  {
    heading: 'Get workout advice',
    message: 'Can you suggest a workout routine that fits my profile?'
  },
  {
    heading: 'Nutrition guidance',
    message: `What adjustments should I make to my diet?`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Chat with Your AI Health Coach
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          I'm here to help you achieve your health and fitness goals. Feel free to ask me anything about your progress, routines, or nutrition.
        </p>
        <p className="leading-normal text-muted-foreground">
          Here are some examples to get started:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
