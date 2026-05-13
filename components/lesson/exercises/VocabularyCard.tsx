import { VocabularyContent } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props { content: VocabularyContent; onNext: () => void }

export function VocabularyCard({ content, onNext }: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide mb-2">New Term</p>
        <h3 className="text-3xl font-bold text-white mb-3">{content.term}</h3>
        <p className="text-slate-300 leading-relaxed">{content.definition}</p>
      </div>
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60">
        <p className="text-xs text-slate-500 mb-2">ATC says:</p>
        <p className="text-sky-300 italic">"{content.example_atc}"</p>
        <p className="text-xs text-slate-500 mt-3 mb-2">You respond:</p>
        <p className="text-green-300 italic">"{content.example_response}"</p>
      </div>
      <Button className="w-full" onClick={onNext}>Got it →</Button>
    </div>
  )
}
