'use client'
import { useState, useRef, useEffect } from 'react'
import { speakATC, cancelSpeech } from '@/lib/speech'
import { Button } from '@/components/ui/Button'
import { SimulationMessage } from '@/types'

interface Props {
  aircraftName: string
}

export function SimulationChat({ aircraftName }: Props) {
  const [messages, setMessages] = useState<SimulationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [scenario] = useState<'departure' | 'arrival'>('departure')
  const [history, setHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!started.current) { started.current = true; startScenario() }
  }, []) // startScenario intentionally omitted — runs once on mount only

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function callAPI(updatedHistory: typeof history) {
    setLoading(true)
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aircraftName, scenario, history: updatedHistory }),
      })
      const data = await res.json()
      return data.text as string
    } finally {
      setLoading(false)
    }
  }

  async function startScenario() {
    const text = await callAPI([])
    const newHistory = [{ role: 'model' as const, parts: [{ text }] }]
    setHistory(newHistory)
    setMessages([{ role: 'atc', text }])
    speakATC(text.replace(/\[.*?\]/g, '').trim())
    if (text.includes('[SCENARIO COMPLETE]')) setIsComplete(true)
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    const pilotMessage = input.trim()
    setInput('')
    cancelSpeech()

    const newHistory = [...history, { role: 'user' as const, parts: [{ text: pilotMessage }] }]
    setMessages(m => [...m, { role: 'pilot', text: pilotMessage }])
    setHistory(newHistory)

    const atcResponse = await callAPI(newHistory)
    const updatedHistory = [...newHistory, { role: 'model' as const, parts: [{ text: atcResponse }] }]
    setHistory(updatedHistory)
    setMessages(m => [...m, { role: 'atc', text: atcResponse }])
    speakATC(atcResponse.replace(/\[.*?\]/g, '').trim())
    if (atcResponse.includes('[SCENARIO COMPLETE]')) setIsComplete(true)
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'pilot' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'atc'
                ? 'bg-slate-800 border border-slate-700 text-sky-300'
                : 'bg-sky-600 text-white'
            }`}>
              <p className="text-xs font-semibold mb-1 opacity-60">
                {msg.role === 'atc' ? '🗼 ATC' : '✈️ You'}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
              <p className="text-sky-400 text-sm">ATC is transmitting…</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isComplete ? (
        <div className="text-center py-4">
          <p className="text-green-400 font-semibold mb-3">Simulation complete! Well done, pilot.</p>
          <Button onClick={() => window.location.reload()}>New Scenario</Button>
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-slate-700">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your readback…"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
        </div>
      )}
    </div>
  )
}
