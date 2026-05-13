'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface LessonCompleteProps {
  xpEarned: number
  score: number
  aircraftSlug: string
}

export function LessonComplete({ xpEarned, score, aircraftSlug }: LessonCompleteProps) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl mb-6">🏆</div>
      <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
      <p className="text-slate-400 mb-6">Great work, pilot.</p>
      <div className="flex gap-6 mb-8">
        <div className="bg-slate-800 rounded-2xl px-6 py-4">
          <p className="text-sky-400 text-2xl font-bold">+{xpEarned}</p>
          <p className="text-slate-400 text-sm">XP earned</p>
        </div>
        <div className="bg-slate-800 rounded-2xl px-6 py-4">
          <p className="text-green-400 text-2xl font-bold">{score}%</p>
          <p className="text-slate-400 text-sm">Score</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push(`/aircraft/${aircraftSlug}`)}>
          Back to Course
        </Button>
        <Button onClick={() => router.push('/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
