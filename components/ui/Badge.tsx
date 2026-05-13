interface BadgeProps {
  icon: string
  name: string
  description: string
  earned?: boolean
}

export function Badge({ icon, name, description, earned = false }: BadgeProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      earned ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-800 opacity-50 grayscale'
    }`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-semibold text-white text-sm">{name}</p>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>
    </div>
  )
}
