'use client'
import { useState } from 'react'
import { FillBlankContent } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { content: FillBlankContent; onNext: (correct: boolean) => void }

export function FillBlank({ content, onNext }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [revealed, setRevealed] = useState(false)

  const parts = content.prompt.split('_____')

  const isAllCorrect = answers.every(
    (a, i) => a.trim().toLowerCase() === content.blanks[i].toLowerCase()
  )

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-2">{content.context}</p>
        <div className="flex flex-wrap items-center gap-1 text-white text-lg">
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <span>{part}</span>
              {i < content.blanks.length && (
                <input
                  type="text"
                  value={answers[i]}
                  onChange={e => {
                    const next = [...answers]
                    next[i] = e.target.value
                    setAnswers(next)
                  }}
                  disabled={revealed}
                  className={cn(
                    'inline-block w-28 px-2 py-1 rounded-lg border text-center text-sm',
                    !revealed && 'bg-slate-700 border-sky-500 text-white focus:outline-none',
                    revealed && answers[i].trim().toLowerCase() === content.blanks[i].toLowerCase()
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : revealed
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : ''
                  )}
                />
              )}
            </span>
          ))}
        </div>
      </div>

      {!revealed ? (
        <Button className="w-full" onClick={() => setRevealed(true)} disabled={answers.some(a => !a.trim())}>
          Check
        </Button>
      ) : (
        <div className={`rounded-xl p-4 ${isAllCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isAllCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isAllCorrect ? '✅ Correct!' : `❌ Correct answers: ${content.blanks.join(', ')}`}
          </p>
          <Button className="mt-3 w-full" onClick={() => onNext(isAllCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
