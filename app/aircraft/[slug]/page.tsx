import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getLevelFromXP } from '@/lib/xp'
import { Lesson } from '@/types'

export default async function AircraftPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: aircraft }, { data: profile }] = await Promise.all([
    supabase.from('aircraft').select('*').eq('slug', params.slug).single(),
    supabase.from('users').select('total_xp').eq('id', user.id).single(),
  ])

  if (!aircraft) notFound()

  const userLevel = getLevelFromXP(profile?.total_xp ?? 0)
  if (userLevel < aircraft.unlock_level) redirect('/dashboard')

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from('lessons').select('*').eq('aircraft_id', aircraft.id).order('order_index'),
    supabase.from('user_progress').select('lesson_id, score').eq('user_id', user.id),
  ])

  const completedLessons = new Set((progress ?? []).map(p => p.lesson_id))
  const completedCount = (lessons ?? []).filter(l => completedLessons.has(l.id)).length
  const simulationUnlocked = completedCount >= 5

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-sky-400 text-sm hover:underline">← Dashboard</Link>
      <div className="mt-4 mb-8">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide">{aircraft.category}</p>
        <h1 className="text-3xl font-bold text-white mt-1">{aircraft.name}</h1>
        <p className="text-slate-400 mt-2">{aircraft.description}</p>
        <p className="text-slate-500 text-sm mt-2">{completedCount}/{(lessons ?? []).length} lessons completed</p>
      </div>

      <div className="space-y-3">
        {(lessons ?? []).map((lesson: Lesson, index: number) => {
          const isCompleted = completedLessons.has(lesson.id)
          const isLocked = index > 0 && !completedLessons.has((lessons ?? [])[index - 1]?.id)
          return (
            <div key={lesson.id}>
              {isLocked ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-semibold text-white">{lesson.title}</p>
                    <p className="text-slate-400 text-sm">{lesson.description}</p>
                  </div>
                </div>
              ) : (
                <Link href={`/aircraft/${params.slug}/lesson/${lesson.id}`}>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-sky-500/10 border-sky-500/40 hover:border-sky-500'
                      : 'bg-slate-800 border-slate-700 hover:border-sky-500'
                  }`}>
                    <span className="text-2xl">{isCompleted ? '✅' : '📡'}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{lesson.title}</p>
                      <p className="text-slate-400 text-sm">{lesson.description}</p>
                    </div>
                    <span className="text-sky-400 text-sm font-semibold">+{lesson.xp_reward} XP</span>
                  </div>
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        {simulationUnlocked ? (
          <Link href={`/aircraft/${params.slug}/simulation`}>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 border border-sky-500 cursor-pointer hover:opacity-90 transition-opacity">
              <p className="text-white font-bold text-lg">🎙️ Live Simulation</p>
              <p className="text-sky-100 text-sm mt-1">Practice a full ATC conversation with an AI controller.</p>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 opacity-50">
            <p className="text-white font-bold text-lg">🔒 Live Simulation</p>
            <p className="text-slate-400 text-sm mt-1">Complete {5 - completedCount} more lessons to unlock.</p>
          </div>
        )}
      </div>
    </main>
  )
}
