import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { LessonClient } from './LessonClient'
import { Exercise } from '@/types'

export default async function LessonPage({ params }: { params: { slug: string; id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: lesson }, { data: exercises }] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', params.id).single(),
    supabase.from('exercises').select('*').eq('lesson_id', params.id).order('order_index'),
  ])

  if (!lesson || !exercises) notFound()

  return <LessonClient lesson={lesson} exercises={exercises as Exercise[]} aircraftSlug={params.slug} />
}
