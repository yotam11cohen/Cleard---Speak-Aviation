'use client'
import { useState } from 'react'
import { CompletePhraseContent } from '@/types'
import { speakATC } from '@/lib/speech'
import { Button } from '@/components/ui/Button'

interface Props { content: CompletePhraseContent; onNext: (correct: boolean) => void }

export function CompletePhrase({ content, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/[.,]/g, '')
  }

  const isCorrect = [content.correct_response, ...content.acceptable_variants]
    .some(v => normalize(v) === normalize(answer))

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1">ATC says:</p>
        <p className="text-sky-300 italic text-lg">&ldquo;{content.atc_text}&rdquo;</p>
        <button onClick={() => speakATC(content.atc_text)} className="mt-2 text-xs text-slate-400 hover:text-sky-400">
          🔊 Replay
        </button>
      </div>

      <p className="text-white font-semibold">Type your pilot readback:</p>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={revealed}
        placeholder="Type your response here…"
        rows={3}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
      />

      {!showHint && !revealed && (
        <button onClick={() => setShowHint(true)} className="text-xs text-slate-400 hover:text-sky-400">
          💡 Show hint
        </button>
      )}
      {showHint && !revealed && (
        <p className="text-slate-400 text-sm italic">{content.hint}</p>
      )}

      {!revealed ? (
        <Button className="w-full" onClick={() => setRevealed(true)} disabled={!answer.trim()}>Check</Button>
      ) : (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Not quite'}
          </p>
          {!isCorrect && (
            <p className="text-slate-300 text-sm mt-1">Expected: <span className="text-green-300">&ldquo;{content.correct_response}&rdquo;</span></p>
          )}
          <Button className="mt-3 w-full" onClick={() => onNext(isCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
