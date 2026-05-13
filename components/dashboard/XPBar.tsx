import { getXPProgress, getLevelFromXP } from '@/lib/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface XPBarProps {
  totalXP: number
}

export function XPBar({ totalXP }: XPBarProps) {
  const level = getLevelFromXP(totalXP)
  const { current, next, percent } = getXPProgress(totalXP)
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar percent={percent} />
        <p className="text-xs text-slate-400 mt-1">
          {next ? `${current} / ${next} XP` : 'Max level reached'}
        </p>
      </div>
    </div>
  )
}
