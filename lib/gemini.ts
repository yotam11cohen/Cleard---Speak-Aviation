import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  })
}

export function buildATCSystemPrompt(aircraftName: string, scenario: 'departure' | 'arrival'): string {
  return `You are an ATC controller at a busy international airport. The pilot is flying a ${aircraftName}.
Conduct a realistic ${scenario} ATC scenario.
Format each message as: [YOUR ATC TRANSMISSION]
After the pilot responds, evaluate their readback on a new line as: [Evaluation: Correct | Partially correct | Incorrect: reason]
Then continue the scenario with your next ATC instruction.
Keep transmissions realistic and concise. Use standard ICAO phraseology.
After 6-8 exchanges, end the scenario with: [SCENARIO COMPLETE]`
}
