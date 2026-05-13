interface LessonProgressProps {
  current: number
  total: number
}

export function LessonProgress({ current, total }: LessonProgressProps) {
  const percent = Math.round((current / total) * 100)
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 bg-slate-700 rounded-full h-3">
        <div className="bg-sky-500 h-3 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-slate-400 text-sm shrink-0">{current}/{total}</span>
    </div>
  )
}
