import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">✈️ Cleard Speak</h1>
        <p className="text-slate-400 mt-2">Sign in to continue your training</p>
      </div>
      <LoginForm />
      <p className="mt-6 text-slate-500 text-sm">
        No account?{' '}
        <Link href="/auth/register" className="text-sky-400 hover:underline">Register</Link>
      </p>
    </main>
  )
}
