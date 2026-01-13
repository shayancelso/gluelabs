interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
}

export async function createChatCompletion(
  messages: Message[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const {
    model = 'openai/gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 1024,
  } = options

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://experiencepoint.app',
      'X-Title': 'ExperiencePoint OKR Assistant',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data: OpenRouterResponse = await response.json()

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response from OpenRouter API')
  }

  return data.choices[0].message.content
}
