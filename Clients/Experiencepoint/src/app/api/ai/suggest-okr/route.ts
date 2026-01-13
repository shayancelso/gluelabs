import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion } from '@/lib/ai/openrouter'
import {
  OKR_SYSTEM_PROMPT,
  buildObjectiveSuggestionPrompt,
  buildKeyResultSuggestionPrompt,
  buildImproveOKRPrompt,
} from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    let userPrompt: string

    switch (action) {
      case 'suggest_objective':
        userPrompt = buildObjectiveSuggestionPrompt({
          level: params.level || 'team',
          timePeriod: params.timePeriod || 'Q1 2025',
          parentObjective: params.parentObjective,
          userInput: params.userInput,
        })
        break

      case 'suggest_key_results':
        userPrompt = buildKeyResultSuggestionPrompt({
          objectiveTitle: params.objectiveTitle,
          objectiveDescription: params.objectiveDescription,
          existingKeyResults: params.existingKeyResults || [],
        })
        break

      case 'improve_okr':
        userPrompt = buildImproveOKRPrompt({
          objectiveTitle: params.objectiveTitle,
          objectiveDescription: params.objectiveDescription,
          keyResults: params.keyResults || [],
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: suggest_objective, suggest_key_results, or improve_okr' },
          { status: 400 }
        )
    }

    const response = await createChatCompletion([
      { role: 'system', content: OKR_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ])

    // Parse the JSON response
    let suggestion
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      suggestion = JSON.parse(cleanedResponse)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: response },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
