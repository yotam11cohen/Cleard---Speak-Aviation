import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLevelFromXP, getXPProgress } from '@/lib/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: allAchievements }, { data: userAchievements }, { data: progress }] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
      supabase.from('user_progress').select('lesson_id').eq('user_id', user.id),
    ])

  const earnedIds = new Set((userAchievements ?? []).map(a => a.achievement_id))
  const level = getLevelFromXP(profile?.total_xp ?? 0)
  const { percent, next } = getXPProgress(profile?.total_xp ?? 0)

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 max-w-xl mx-auto">
      <Link href="/dashboard" className="text-sky-400 text-sm hover:underline">← Dashboard</Link>
      <div className="mt-6 mb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-sky-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
          {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <h1 className="text-2xl font-bold text-white">{profile?.display_name}</h1>
        <p className="text-slate-400">Level {level} Pilot</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-sky-400">{profile?.total_xp ?? 0}</p>
          <p className="text-slate-400 text-xs">Total XP</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-orange-400">🔥 {profile?.streak_count ?? 0}</p>
          <p className="text-slate-400 text-xs">Day streak</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">{(progress ?? []).length}</p>
          <p className="text-slate-400 text-xs">Lessons done</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-2">Progress to level {level + 1}</p>
        <ProgressBar percent={next ? percent : 100} />
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Achievements</h2>
      <div className="space-y-3">
        {(allAchievements ?? []).map(a => (
          <Badge
            key={a.id}
            icon={a.icon}
            name={a.name}
            description={a.description}
            earned={earnedIds.has(a.id)}
          />
        ))}
      </div>
    </main>
  )
}
