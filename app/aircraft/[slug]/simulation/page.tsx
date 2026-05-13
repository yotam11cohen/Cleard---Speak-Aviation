import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SimulationChat } from '@/components/simulation/SimulationChat'

export default async function SimulationPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: aircraft } = await supabase.from('aircraft').select('*').eq('slug', params.slug).single()
  if (!aircraft) notFound()

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from('lessons').select('id').eq('aircraft_id', aircraft.id),
    supabase.from('user_progress').select('lesson_id').eq('user_id', user.id),
  ])

  const completedIds = new Set((progress ?? []).map(p => p.lesson_id))
  const completedCount = (lessons ?? []).filter(l => completedIds.has(l.id)).length
  if (completedCount < 5) redirect(`/aircraft/${params.slug}`)

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 max-w-xl mx-auto flex flex-col">
      <div className="mb-4">
        <Link href={`/aircraft/${params.slug}`} className="text-sky-400 text-sm hover:underline">
          ← {aircraft.name}
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">🎙️ Live Simulation</h1>
        <p className="text-slate-400 text-sm">Respond to ATC as if you're flying the {aircraft.name}.</p>
      </div>
      <SimulationChat aircraftName={aircraft.name} aircraftSlug={params.slug} />
    </main>
  )
}
