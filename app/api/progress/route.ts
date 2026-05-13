import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateLessonXP, getLevelFromXP } from '@/lib/xp'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, score, isPerfect } = await request.json() as {
    lessonId: string
    score: number
    isPerfect: boolean
  }

  const xpEarned = calculateLessonXP(isPerfect)

  const { error: progressError } = await supabase.from('user_progress').upsert(
    { user_id: user.id, lesson_id: lessonId, xp_earned: xpEarned, score },
    { onConflict: 'user_id,lesson_id' }
  )
  if (progressError) return NextResponse.json({ error: progressError.message }, { status: 500 })

  const { data: profile } = await supabase.from('users').select('total_xp, streak_count, last_active').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  const lastActive = profile.last_active
  const isNewDay = lastActive !== today
  const isConsecutive = lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const newXP = profile.total_xp + xpEarned
  const newStreak = isNewDay ? (isConsecutive ? profile.streak_count + 1 : 1) : profile.streak_count
  const newLevel = getLevelFromXP(newXP)

  await supabase.from('users').update({
    total_xp: newXP,
    level: newLevel,
    streak_count: newStreak,
    last_active: today,
  }).eq('id', user.id)

  return NextResponse.json({ xpEarned, newXP, newStreak })
}
