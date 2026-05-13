interface StreakBannerProps {
  streakCount: number
}

export function StreakBanner({ streakCount }: StreakBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
      <span className="text-2xl">🔥</span>
      <div>
        <p className="text-orange-400 font-bold text-lg leading-none">{streakCount}</p>
        <p className="text-orange-300 text-xs">day streak</p>
      </div>
    </div>
  )
}
