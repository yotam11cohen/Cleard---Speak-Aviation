import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AircraftCard } from '@/components/dashboard/AircraftCard'
import { StreakBanner } from '@/components/dashboard/StreakBanner'
import { XPBar } from '@/components/dashboard/XPBar'
import { getLevelFromXP } from '@/lib/xp'
import { Aircraft } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: aircraft }, { data: allLessons }, { data: progress }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('aircraft').select('*').order('order_index'),
    supabase.from('lessons').select('id, aircraft_id'),
    supabase.from('user_progress').select('lesson_id').eq('user_id', user.id),
  ])

  const userLevel = getLevelFromXP(profile?.total_xp ?? 0)
  const completedLessonIds = new Set((progress ?? []).map(p => p.lesson_id))

  const lessonCountByAircraft: Record<string, number> = {}
  const completedCountByAircraft: Record<string, number> = {}
  for (const lesson of allLessons ?? []) {
    lessonCountByAircraft[lesson.aircraft_id] = (lessonCountByAircraft[lesson.aircraft_id] ?? 0) + 1
    if (completedLessonIds.has(lesson.id)) {
      completedCountByAircraft[lesson.aircraft_id] = (completedCountByAircraft[lesson.aircraft_id] ?? 0) + 1
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.display_name ?? 'Pilot'} ✈️
          </h1>
          <p className="text-slate-400 text-sm mt-1">Level {userLevel} Pilot</p>
        </div>
        <StreakBanner streakCount={profile?.streak_count ?? 0} />
      </div>

      <div className="mb-8">
        <XPBar totalXP={profile?.total_xp ?? 0} />
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Your Aircraft</h2>
      <div className="grid gap-4">
        {(aircraft ?? []).map((ac: Aircraft) => (
          <AircraftCard
            key={ac.id}
            aircraft={ac}
            isUnlocked={userLevel >= ac.unlock_level}
            completedLessons={completedCountByAircraft[ac.id] ?? 0}
            totalLessons={lessonCountByAircraft[ac.id] ?? 0}
          />
        ))}
      </div>
    </main>
  )
}
