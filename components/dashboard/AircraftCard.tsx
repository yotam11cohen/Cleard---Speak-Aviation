import Link from 'next/link'
import { Aircraft } from '@/types'

interface AircraftCardProps {
  aircraft: Aircraft
  isUnlocked: boolean
  completedLessons: number
  totalLessons: number
}

export function AircraftCard({ aircraft, isUnlocked, completedLessons, totalLessons }: AircraftCardProps) {
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (!isUnlocked) {
    return (
      <div className="relative p-5 rounded-2xl bg-slate-800 border border-slate-700 opacity-60 cursor-not-allowed select-none">
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/60 z-10">
          <span className="text-4xl">🔒</span>
        </div>
        <p className="text-sm text-slate-500 font-medium">{aircraft.category}</p>
        <h3 className="text-lg font-bold text-white mt-1">{aircraft.name}</h3>
        <p className="text-xs text-slate-500 mt-1">Unlock at level {aircraft.unlock_level}</p>
      </div>
    )
  }

  return (
    <Link href={`/aircraft/${aircraft.slug}`}>
      <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-sky-500 transition-colors cursor-pointer">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide">{aircraft.category}</p>
        <h3 className="text-lg font-bold text-white mt-1">{aircraft.name}</h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{aircraft.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
