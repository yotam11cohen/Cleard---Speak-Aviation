'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

const PUBLIC_ROUTES = ['/', '/auth']

export function Navbar() {
  const pathname = usePathname()
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith('/auth'))
  if (isPublic) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-4 py-2">
        {links.map(link => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors',
                active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
