import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">✈️ Cleard Speak</h1>
        <p className="text-slate-400 mt-2">Create your pilot account</p>
      </div>
      <RegisterForm />
      <p className="mt-6 text-slate-500 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-sky-400 hover:underline">Sign in</Link>
      </p>
    </main>
  )
}
