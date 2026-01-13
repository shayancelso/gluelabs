export const OKR_SYSTEM_PROMPT = `You are an expert OKR (Objectives and Key Results) coach helping teams create effective, measurable goals. You understand the OKR framework deeply and can help craft objectives that are inspiring and ambitious, while ensuring key results are specific, measurable, and time-bound.

Guidelines for creating OKRs:
- Objectives should be qualitative, inspirational, and ambitious
- Objectives should answer "What do we want to achieve?"
- Key Results should be quantitative and measurable
- Key Results should answer "How will we know we've achieved it?"
- Aim for 3-5 Key Results per Objective
- Key Results should be challenging but achievable (70% completion is considered success)
- Use specific metrics: percentages, numbers, currency amounts, or yes/no outcomes

When suggesting OKRs, always return valid JSON in this exact format:
{
  "objective": {
    "title": "string - the objective title",
    "description": "string - optional description explaining the objective"
  },
  "keyResults": [
    {
      "title": "string - the key result title",
      "metricType": "percentage" | "number" | "currency" | "binary",
      "startValue": number,
      "targetValue": number,
      "unit": "string - optional unit like 'users', 'deals', '$', '%'"
    }
  ]
}

Only respond with the JSON, no additional text or explanation.`

export const OBJECTIVE_SUGGESTION_PROMPT = `Based on the following context, suggest a well-crafted OKR (Objective with 3-5 Key Results).

Context:
- OKR Level: {level} (company/team/individual level objective)
- Time Period: {timePeriod}
{parentContext}
{userInput}

Create an OKR that:
1. Is appropriate for the {level} level
2. {alignmentGuidance}
3. Has measurable, specific key results
4. Is ambitious but achievable`

export const KEY_RESULT_SUGGESTION_PROMPT = `Suggest 3 additional key results for the following objective:

Objective: {objectiveTitle}
{objectiveDescription}

Existing Key Results:
{existingKeyResults}

The new key results should:
1. Be complementary to existing ones (not overlapping)
2. Cover different aspects of achieving the objective
3. Be specific and measurable
4. Have clear metrics (percentage, number, currency, or yes/no)

Return only the JSON array of new key results.`

export const IMPROVE_OKR_PROMPT = `Review and improve the following OKR to make it more effective:

Current Objective: {objectiveTitle}
{objectiveDescription}

Current Key Results:
{keyResults}

Provide an improved version that:
1. Has a more inspiring and clear objective
2. Has more specific and measurable key results
3. Uses appropriate metric types
4. Sets ambitious but achievable targets

Return the improved OKR in the standard JSON format.`

export function buildObjectiveSuggestionPrompt(params: {
  level: 'company' | 'team' | 'individual'
  timePeriod: string
  parentObjective?: { title: string; description?: string }
  userInput?: string
}): string {
  const { level, timePeriod, parentObjective, userInput } = params

  let parentContext = ''
  let alignmentGuidance = ''

  if (parentObjective) {
    parentContext = `- Parent Objective: "${parentObjective.title}"${
      parentObjective.description ? ` - ${parentObjective.description}` : ''
    }`
    alignmentGuidance = `Aligns with and contributes to the parent objective`
  } else if (level === 'company') {
    alignmentGuidance = `Sets a clear strategic direction for the organization`
  } else {
    alignmentGuidance = `Is meaningful and impactful for the ${level}`
  }

  const userInputSection = userInput
    ? `- User's idea/direction: "${userInput}"`
    : '- No specific direction provided, suggest based on common ${level}-level priorities'

  return OBJECTIVE_SUGGESTION_PROMPT
    .replace('{level}', level)
    .replace('{level}', level)
    .replace('{timePeriod}', timePeriod)
    .replace('{parentContext}', parentContext)
    .replace('{userInput}', userInputSection)
    .replace('{alignmentGuidance}', alignmentGuidance)
}

export function buildKeyResultSuggestionPrompt(params: {
  objectiveTitle: string
  objectiveDescription?: string
  existingKeyResults: { title: string; metricType: string; targetValue: number; unit?: string }[]
}): string {
  const { objectiveTitle, objectiveDescription, existingKeyResults } = params

  const existingKRsText = existingKeyResults.length > 0
    ? existingKeyResults.map((kr, i) => `${i + 1}. ${kr.title} (Target: ${kr.targetValue}${kr.unit ? ' ' + kr.unit : ''})`).join('\n')
    : 'None yet'

  return KEY_RESULT_SUGGESTION_PROMPT
    .replace('{objectiveTitle}', objectiveTitle)
    .replace('{objectiveDescription}', objectiveDescription ? `Description: ${objectiveDescription}` : '')
    .replace('{existingKeyResults}', existingKRsText)
}

export function buildImproveOKRPrompt(params: {
  objectiveTitle: string
  objectiveDescription?: string
  keyResults: { title: string; metricType: string; startValue: number; targetValue: number; unit?: string }[]
}): string {
  const { objectiveTitle, objectiveDescription, keyResults } = params

  const krsText = keyResults.map((kr, i) =>
    `${i + 1}. ${kr.title}\n   Type: ${kr.metricType}, Start: ${kr.startValue}, Target: ${kr.targetValue}${kr.unit ? ' ' + kr.unit : ''}`
  ).join('\n')

  return IMPROVE_OKR_PROMPT
    .replace('{objectiveTitle}', objectiveTitle)
    .replace('{objectiveDescription}', objectiveDescription ? `Description: ${objectiveDescription}` : '')
    .replace('{keyResults}', krsText)
}
