interface ProgressBarProps {
  percent: number
  color?: string
  label?: string
}

export function ProgressBar({ percent, color = 'bg-sky-500', label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full">
      {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
