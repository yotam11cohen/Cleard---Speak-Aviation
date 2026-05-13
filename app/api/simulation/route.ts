import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getGeminiModel, buildATCSystemPrompt } from '@/lib/gemini'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { aircraftName, scenario, history } = await request.json() as {
    aircraftName: string
    scenario: 'departure' | 'arrival'
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
  }

  try {
    const model = getGeminiModel()
    const systemPrompt = buildATCSystemPrompt(aircraftName, scenario)

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. Initiating ATC scenario.' }] },
        ...history,
      ],
    })

    const userMessage = history.length === 0
      ? 'Begin the scenario with your first ATC transmission.'
      : history[history.length - 1].parts[0].text

    const result = await chat.sendMessage(userMessage)
    return NextResponse.json({ text: result.response.text() })
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })
  }
}
