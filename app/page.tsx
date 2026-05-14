import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-extrabold text-white mb-4">✈️ Cleard Speak</h1>
      <p className="text-xl text-slate-300 max-w-md mb-4">
        Learn aviation radio communication — the language pilots and air traffic controllers speak.
      </p>
      <p className="text-slate-500 mb-10">Train for VATSIM. Speak like a real pilot.</p>
      <div className="flex gap-4">
        <Link href="/auth/register"><Button size="lg">Get Started</Button></Link>
        <Link href="/auth/login"><Button size="lg" variant="secondary">Sign In</Button></Link>
      </div>
      <div className="mt-20 grid grid-cols-3 gap-8 text-center max-w-lg">
        {[
          { icon: '🎙️', label: 'Real ATC phrases' },
          { icon: '🔥', label: 'Daily streaks' },
          { icon: '✈️', label: 'Multiple aircraft' },
        ].map(f => (
          <div key={f.label}>
            <div className="text-4xl mb-2">{f.icon}</div>
            <p className="text-slate-400 text-sm">{f.label}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
