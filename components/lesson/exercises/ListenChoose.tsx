'use client'
import { useState, useEffect } from 'react'
import { ListenChooseContent } from '@/types'
import { speakATC } from '@/lib/speech'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { content: ListenChooseContent; onNext: (correct: boolean) => void }

export function ListenChoose({ content, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    speakATC(content.atc_text)
  }, [content.atc_text])

  function handleSelect(index: number) {
    if (revealed) return
    setSelected(index)
    setRevealed(true)
  }

  const isCorrect = selected === content.correct_index

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1">ATC transmission:</p>
        <p className="text-sky-300 italic text-lg">&ldquo;{content.atc_text}&rdquo;</p>
        <button
          onClick={() => speakATC(content.atc_text)}
          className="mt-3 text-xs text-slate-400 hover:text-sky-400 transition-colors"
        >
          🔊 Replay
        </button>
      </div>

      <p className="text-white font-semibold">{content.question}</p>

      <div className="space-y-2">
        {content.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border transition-colors',
              !revealed && 'bg-slate-800 border-slate-700 hover:border-sky-500 text-white',
              revealed && i === content.correct_index && 'bg-green-500/20 border-green-500 text-green-300',
              revealed && i === selected && i !== content.correct_index && 'bg-red-500/20 border-red-500 text-red-300',
              revealed && i !== selected && i !== content.correct_index && 'bg-slate-800 border-slate-700 text-slate-500'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {revealed && (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-slate-300 text-sm mt-1">{content.explanation}</p>
          <Button className="mt-3 w-full" onClick={() => onNext(isCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
