# Cleard Speak Aviation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Duolingo-style web app for learning aviation radio telephony (ATC communication), aimed at VATSIM flight sim enthusiasts.

**Architecture:** Next.js 14 App Router for frontend + API routes, Supabase for auth/DB, Gemini API (free tier) for conversation simulation, Web Speech API for audio.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (`@supabase/ssr`), `@google/generative-ai`, Jest + React Testing Library

---

## File Structure

```
cleard-speak-aviation/
├── app/
│   ├── layout.tsx                         # Root layout (fonts, Tailwind)
│   ├── page.tsx                           # Landing page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── aircraft/
│   │   └── [slug]/
│   │       ├── page.tsx                   # Course overview
│   │       ├── lesson/[id]/page.tsx       # Active lesson
│   │       └── simulation/page.tsx        # AI simulation
│   ├── profile/page.tsx
│   └── api/
│       ├── progress/route.ts              # POST: save lesson progress
│       └── simulation/route.ts            # POST: Gemini chat turn
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Badge.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── AircraftCard.tsx
│   │   ├── StreakBanner.tsx
│   │   └── XPBar.tsx
│   ├── lesson/
│   │   ├── LessonProgress.tsx
│   │   ├── LessonComplete.tsx
│   │   └── exercises/
│   │       ├── VocabularyCard.tsx
│   │       ├── ListenChoose.tsx
│   │       ├── FillBlank.tsx
│   │       └── CompletePhrase.tsx
│   └── simulation/
│       └── SimulationChat.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser Supabase client
│   │   └── server.ts                      # Server Supabase client
│   ├── gemini.ts                          # Gemini API wrapper
│   ├── speech.ts                          # Web Speech API utils
│   └── xp.ts                             # XP/level/streak logic
├── middleware.ts                          # Auth session refresh
├── types/
│   └── index.ts                          # All shared TypeScript types
├── content/
│   └── aircraft/
│       ├── cessna-172/
│       │   ├── meta.json
│       │   └── lessons/
│       │       ├── 01-ground-communication.json
│       │       └── 02-departure.json
│       └── a320neo/
│           ├── meta.json
│           └── lessons/
│               └── 01-ground-communication.json
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed.ts                            # Seeds aircraft + lessons from content/
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`
- Create: `jest.config.ts`, `jest.setup.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd C:\Users\me\Downloads\Yotam\development\cleard-speak-aviation
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Answer prompts: Yes TypeScript, Yes Tailwind, Yes App Router, No src dir, `@/*` alias.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

- [ ] **Step 3: Configure Jest**

Create `jest.config.ts`:
```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Copy to `.env.local` and fill in your values from Supabase dashboard and Google AI Studio.

- [ ] **Step 5: Verify setup**

```bash
npm run dev
```
Expected: Next.js runs on http://localhost:3000 with default page.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: initial Next.js 14 scaffold with Tailwind + Jest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Write all shared types**

Create `types/index.ts`:
```ts
export type AircraftCategory = 'GA' | 'Commercial' | 'Military'

export type ExerciseType = 'listen_choose' | 'fill_blank' | 'complete_phrase' | 'vocabulary'

export interface Aircraft {
  id: string
  name: string
  slug: string
  category: AircraftCategory
  description: string
  icon_url: string
  unlock_level: number
  order_index: number
}

export interface Lesson {
  id: string
  aircraft_id: string
  order_index: number
  title: string
  description: string
  type: 'lesson' | 'simulation'
  xp_reward: number
}

export interface Exercise {
  id: string
  lesson_id: string
  order_index: number
  type: ExerciseType
  content: ListenChooseContent | FillBlankContent | CompletePhraseContent | VocabularyContent
}

export interface ListenChooseContent {
  atc_text: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export interface FillBlankContent {
  prompt: string
  blanks: string[]
  context: string
}

export interface CompletePhraseContent {
  atc_text: string
  correct_response: string
  hint: string
  acceptable_variants: string[]
}

export interface VocabularyContent {
  term: string
  definition: string
  example_atc: string
  example_response: string
}

export interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
  streak_count: number
  last_active: string | null
}

export interface UserProgress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
  xp_earned: number
  score: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  criteria: { type: string; value: number }
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  earned_at: string
  achievement: Achievement
}

export interface SimulationMessage {
  role: 'atc' | 'pilot'
  text: string
  evaluation?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "chore: add shared TypeScript types"
```

---

## Task 3: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Note your Project URL and anon key. Add them to `.env.local`.

- [ ] **Step 2: Write migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Aircraft categories enum
create type aircraft_category as enum ('GA', 'Commercial', 'Military');

-- Exercise types enum
create type exercise_type as enum ('listen_choose', 'fill_blank', 'complete_phrase', 'vocabulary');

-- Lesson types enum
create type lesson_type as enum ('lesson', 'simulation');

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  total_xp integer not null default 0,
  level integer not null default 1,
  streak_count integer not null default 0,
  last_active date
);

-- Aircraft (courses)
create table public.aircraft (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category aircraft_category not null,
  description text not null,
  icon_url text not null,
  unlock_level integer not null default 1,
  order_index integer not null
);

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references public.aircraft(id) on delete cascade not null,
  order_index integer not null,
  title text not null,
  description text not null,
  type lesson_type not null default 'lesson',
  xp_reward integer not null default 10
);

-- Exercises
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  order_index integer not null,
  type exercise_type not null,
  content jsonb not null
);

-- User progress
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed_at timestamptz not null default now(),
  xp_earned integer not null,
  score integer not null check (score >= 0 and score <= 100),
  unique(user_id, lesson_id)
);

-- Achievements
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null
);

-- User achievements
create table public.user_achievements (
  user_id uuid references public.users(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- RLS policies
alter table public.users enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_achievements enable row level security;

-- Users can read/update only their own row
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Progress: users see only their own
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);

-- User achievements: users see only their own
create policy "Users can view own achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

-- Aircraft, lessons, exercises: public read
alter table public.aircraft enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.achievements enable row level security;

create policy "Public read aircraft" on public.aircraft for select using (true);
create policy "Public read lessons" on public.lessons for select using (true);
create policy "Public read exercises" on public.exercises for select using (true);
create policy "Public read achievements" on public.achievements for select using (true);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Run migration in Supabase**

Go to Supabase dashboard → SQL Editor → paste the migration → Run.

Expected: All tables created with no errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: database schema with RLS policies"
```

---

## Task 4: Supabase Client + Auth Middleware

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Browser client**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Server client**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Auth middleware**

Create `middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/aircraft', '/profile']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: Supabase client setup and auth middleware"
```

---

## Task 5: XP & Level Logic

**Files:**
- Create: `lib/xp.ts`
- Create: `__tests__/lib/xp.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/xp.test.ts`:
```ts
import { getLevelFromXP, getXPForNextLevel, getXPProgress, calculateLessonXP } from '@/lib/xp'

describe('getLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => expect(getLevelFromXP(0)).toBe(1))
  it('returns level 1 for 499 XP', () => expect(getLevelFromXP(499)).toBe(1))
  it('returns level 2 for 500 XP', () => expect(getLevelFromXP(500)).toBe(2))
  it('returns level 3 for 1500 XP', () => expect(getLevelFromXP(1500)).toBe(3))
  it('returns level 4 for 3000 XP', () => expect(getLevelFromXP(3000)).toBe(4))
  it('returns level 5 for 6000 XP', () => expect(getLevelFromXP(6000)).toBe(5))
  it('returns level 5 for XP above max', () => expect(getLevelFromXP(99999)).toBe(5))
})

describe('getXPForNextLevel', () => {
  it('returns 500 for level 1', () => expect(getXPForNextLevel(1)).toBe(500))
  it('returns 1500 for level 2', () => expect(getXPForNextLevel(2)).toBe(1500))
  it('returns null for max level', () => expect(getXPForNextLevel(5)).toBeNull())
})

describe('getXPProgress', () => {
  it('returns 50% progress halfway through level', () => {
    expect(getXPProgress(250)).toEqual({ current: 250, next: 500, percent: 50 })
  })
  it('returns 100% at max level', () => {
    expect(getXPProgress(6000)).toEqual({ current: 6000, next: null, percent: 100 })
  })
})

describe('calculateLessonXP', () => {
  it('returns 10 base XP for a normal lesson', () => expect(calculateLessonXP(false)).toBe(10))
  it('returns 15 XP for a perfect lesson', () => expect(calculateLessonXP(true)).toBe(15))
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/lib/xp.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/xp'`

- [ ] **Step 3: Implement xp.ts**

Create `lib/xp.ts`:
```ts
const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000]

export function getLevelFromXP(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

export function getXPForNextLevel(level: number): number | null {
  return LEVEL_THRESHOLDS[level] ?? null
}

export function getXPProgress(totalXP: number): { current: number; next: number | null; percent: number } {
  const level = getLevelFromXP(totalXP)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1]
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? null

  if (nextThreshold === null) return { current: totalXP, next: null, percent: 100 }

  const range = nextThreshold - currentThreshold
  const progress = totalXP - currentThreshold
  return { current: totalXP, next: nextThreshold, percent: Math.round((progress / range) * 100) }
}

export function calculateLessonXP(isPerfect: boolean): number {
  return isPerfect ? 15 : 10
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/lib/xp.test.ts
```
Expected: PASS — 9 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/xp.ts __tests__/lib/xp.test.ts
git commit -m "feat: XP, level, and progress calculation logic"
```

---

## Task 6: Web Speech API Utility

**Files:**
- Create: `lib/speech.ts`

- [ ] **Step 1: Write speech utility**

Create `lib/speech.ts`:
```ts
export function speakATC(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1.1   // slightly faster, like radio
  utterance.pitch = 0.85 // slightly lower pitch
  utterance.volume = 1

  // Prefer a US English voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
    ?? voices.find(v => v.lang === 'en-US')
  if (preferred) utterance.voice = preferred

  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/speech.ts
git commit -m "feat: Web Speech API utility for ATC audio"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Button component**

Create `components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white font-semibold',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Add cn utility**

Create `lib/utils.ts`:
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: ProgressBar component**

Create `components/ui/ProgressBar.tsx`:
```tsx
interface ProgressBarProps {
  percent: number
  color?: string
  label?: string
}

export function ProgressBar({ percent, color = 'bg-sky-500', label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full">
      {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Badge component**

Create `components/ui/Badge.tsx`:
```tsx
interface BadgeProps {
  icon: string
  name: string
  description: string
  earned?: boolean
}

export function Badge({ icon, name, description, earned = false }: BadgeProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      earned ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-800 opacity-50 grayscale'
    }`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-semibold text-white text-sm">{name}</p>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/ lib/utils.ts
git commit -m "feat: shared UI components (Button, ProgressBar, Badge)"
```

---

## Task 8: Auth Pages

**Files:**
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/register/page.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/RegisterForm.tsx`

- [ ] **Step 1: LoginForm component**

Create `components/auth/LoginForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center text-xs text-slate-500"><span className="px-2 bg-slate-900">or</span></div>
      </div>
      <Button variant="secondary" className="w-full" onClick={handleGoogleLogin}>
        Continue with Google
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Login page**

Create `app/auth/login/page.tsx`:
```tsx
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
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
```

- [ ] **Step 3: RegisterForm component**

Create `components/auth/RegisterForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleRegister} className="w-full max-w-sm space-y-3">
      <input
        type="text"
        placeholder="Callsign / Display Name"
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        required
        minLength={2}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Register page**

Create `app/auth/register/page.tsx`:
```tsx
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
```

- [ ] **Step 5: Add Google OAuth callback route**

Create `app/auth/callback/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

- [ ] **Step 6: Commit**

```bash
git add app/auth/ components/auth/
git commit -m "feat: auth pages (login, register, Google OAuth)"
```

---

## Task 9: Content Files (Cessna 172 + A320neo)

**Files:**
- Create: `content/aircraft/cessna-172/meta.json`
- Create: `content/aircraft/cessna-172/lessons/01-ground-communication.json`
- Create: `content/aircraft/cessna-172/lessons/02-departure.json`
- Create: `content/aircraft/a320neo/meta.json`
- Create: `content/aircraft/a320neo/lessons/01-ground-communication.json`

- [ ] **Step 1: Cessna 172 meta**

Create `content/aircraft/cessna-172/meta.json`:
```json
{
  "name": "Cessna 172",
  "slug": "cessna-172",
  "category": "GA",
  "description": "Start your aviation journey with the world's most popular training aircraft. Learn basic VFR communications at towered airports.",
  "icon_url": "/icons/cessna-172.png",
  "unlock_level": 1,
  "order_index": 1
}
```

- [ ] **Step 2: Cessna 172 — Ground Communication lesson**

Create `content/aircraft/cessna-172/lessons/01-ground-communication.json`:
```json
{
  "order_index": 1,
  "title": "Ground Communication",
  "description": "Learn to communicate with ground control: taxi clearances and readbacks.",
  "type": "lesson",
  "xp_reward": 10,
  "exercises": [
    {
      "order_index": 1,
      "type": "vocabulary",
      "content": {
        "term": "Squawk",
        "definition": "Set your transponder to a specific 4-digit code assigned by ATC.",
        "example_atc": "N172SP, squawk 4521.",
        "example_response": "Squawk 4521, N172SP."
      }
    },
    {
      "order_index": 2,
      "type": "vocabulary",
      "content": {
        "term": "Readback",
        "definition": "Repeat the key parts of an ATC clearance back to the controller to confirm you understood correctly.",
        "example_atc": "N172SP, taxi to runway 28 via Alpha, hold short of runway 10.",
        "example_response": "Taxi to runway 28 via Alpha, hold short of runway 10, N172SP."
      }
    },
    {
      "order_index": 3,
      "type": "listen_choose",
      "content": {
        "atc_text": "N172SP, taxi to runway 28 via Alpha, hold short of runway 10.",
        "question": "Where are you instructed to hold short?",
        "options": ["Runway 28", "Runway 10", "Taxiway Alpha", "The ramp"],
        "correct_index": 1,
        "explanation": "ATC said 'hold short of runway 10' — you must stop before crossing runway 10."
      }
    },
    {
      "order_index": 4,
      "type": "fill_blank",
      "content": {
        "prompt": "N172SP, taxi to _____ 28 via _____, hold short of runway 10.",
        "blanks": ["runway", "Alpha"],
        "context": "ATC is giving you a taxi clearance to runway 28 via taxiway Alpha."
      }
    },
    {
      "order_index": 5,
      "type": "complete_phrase",
      "content": {
        "atc_text": "N172SP, taxi to runway 28 via Alpha, hold short of runway 10.",
        "correct_response": "Taxi to runway 28 via Alpha, hold short of runway 10, N172SP.",
        "hint": "Read back the taxi route and hold short instruction, then say your callsign.",
        "acceptable_variants": [
          "Runway 28 via Alpha, hold short runway 10, N172SP.",
          "Taxi runway 28 Alpha, hold short of 10, N172SP."
        ]
      }
    },
    {
      "order_index": 6,
      "type": "listen_choose",
      "content": {
        "atc_text": "N172SP, contact ground 121.9, good day.",
        "question": "What should you do next?",
        "options": [
          "Switch to frequency 121.9 and call ground control",
          "Stay on this frequency",
          "Contact tower on 121.9",
          "Taxi to the terminal"
        ],
        "correct_index": 0,
        "explanation": "When told to 'contact ground 121.9', tune your radio to 121.9 MHz and call ground control."
      }
    },
    {
      "order_index": 7,
      "type": "complete_phrase",
      "content": {
        "atc_text": "N172SP, contact ground 121.9.",
        "correct_response": "Ground 121.9, N172SP.",
        "hint": "Acknowledge by repeating the frequency and your callsign.",
        "acceptable_variants": ["121.9, N172SP.", "Wilco, N172SP."]
      }
    }
  ]
}
```

- [ ] **Step 3: Cessna 172 — Departure lesson**

Create `content/aircraft/cessna-172/lessons/02-departure.json`:
```json
{
  "order_index": 2,
  "title": "Departure & Takeoff",
  "description": "Communicate with tower for takeoff clearance and initial departure instructions.",
  "type": "lesson",
  "xp_reward": 10,
  "exercises": [
    {
      "order_index": 1,
      "type": "vocabulary",
      "content": {
        "term": "Cleared for takeoff",
        "definition": "ATC authorizes you to begin your takeoff roll on the assigned runway.",
        "example_atc": "N172SP, runway 28, cleared for takeoff.",
        "example_response": "Runway 28, cleared for takeoff, N172SP."
      }
    },
    {
      "order_index": 2,
      "type": "vocabulary",
      "content": {
        "term": "Fly runway heading",
        "definition": "After takeoff, maintain the magnetic heading of the runway until further instructions.",
        "example_atc": "N172SP, fly runway heading, climb and maintain 3,000.",
        "example_response": "Runway heading, climb maintain 3,000, N172SP."
      }
    },
    {
      "order_index": 3,
      "type": "listen_choose",
      "content": {
        "atc_text": "N172SP, runway 28, cleared for takeoff, fly runway heading.",
        "question": "What heading should you fly after takeoff?",
        "options": ["Turn left immediately", "Fly the heading of runway 28", "Climb to 3,000 feet", "Contact departure"],
        "correct_index": 1,
        "explanation": "Runway 28 has a magnetic heading of approximately 280°. You fly that heading until ATC gives new instructions."
      }
    },
    {
      "order_index": 4,
      "type": "complete_phrase",
      "content": {
        "atc_text": "N172SP, runway 28, cleared for takeoff.",
        "correct_response": "Runway 28, cleared for takeoff, N172SP.",
        "hint": "Read back the runway and clearance, then your callsign.",
        "acceptable_variants": ["Cleared for takeoff runway 28, N172SP.", "28, cleared for takeoff, N172SP."]
      }
    },
    {
      "order_index": 5,
      "type": "fill_blank",
      "content": {
        "prompt": "N172SP, runway _____, cleared for _____, fly runway heading.",
        "blanks": ["28", "takeoff"],
        "context": "Tower is clearing you for takeoff on runway 28."
      }
    },
    {
      "order_index": 6,
      "type": "listen_choose",
      "content": {
        "atc_text": "N172SP, contact departure 119.1, good day.",
        "question": "What frequency do you switch to?",
        "options": ["121.9", "118.3", "119.1", "122.8"],
        "correct_index": 2,
        "explanation": "ATC said contact departure on 119.1 — tune your radio to 119.1 MHz."
      }
    },
    {
      "order_index": 7,
      "type": "complete_phrase",
      "content": {
        "atc_text": "N172SP, contact departure 119.1.",
        "correct_response": "Departure 119.1, N172SP.",
        "hint": "Acknowledge by repeating the frequency and callsign.",
        "acceptable_variants": ["119.1, N172SP.", "Over to departure 119.1, N172SP."]
      }
    }
  ]
}
```

- [ ] **Step 4: A320neo meta**

Create `content/aircraft/a320neo/meta.json`:
```json
{
  "name": "Airbus A320neo",
  "slug": "a320neo",
  "category": "Commercial",
  "description": "Step up to commercial aviation. Learn IFR procedures, ATIS, clearance delivery, and airline-style communication.",
  "icon_url": "/icons/a320neo.png",
  "unlock_level": 2,
  "order_index": 2
}
```

- [ ] **Step 5: A320neo — Ground Communication lesson**

Create `content/aircraft/a320neo/lessons/01-ground-communication.json`:
```json
{
  "order_index": 1,
  "title": "Clearance Delivery",
  "description": "Obtain your IFR clearance before pushback. Learn the CRAFT acronym.",
  "type": "lesson",
  "xp_reward": 10,
  "exercises": [
    {
      "order_index": 1,
      "type": "vocabulary",
      "content": {
        "term": "CRAFT",
        "definition": "The acronym for IFR clearance items: Clearance limit, Route, Altitude, Frequency, Transponder (squawk).",
        "example_atc": "EZY123, cleared to London Heathrow via BOGNA, MERLU, MATCH, flight planned route. Climb via SID to FL150. Squawk 2341.",
        "example_response": "Cleared to London Heathrow via BOGNA MERLU MATCH, climb via SID to FL150, squawk 2341, EZY123."
      }
    },
    {
      "order_index": 2,
      "type": "vocabulary",
      "content": {
        "term": "Push and start",
        "definition": "Request to push the aircraft back from the gate and start engines.",
        "example_atc": "EZY123, push and start approved, face south.",
        "example_response": "Push and start approved, face south, EZY123."
      }
    },
    {
      "order_index": 3,
      "type": "listen_choose",
      "content": {
        "atc_text": "EZY123, cleared to London Heathrow via flight planned route. Climb initially to FL70, expect FL350 ten minutes after departure. Departure frequency 119.72. Squawk 2341.",
        "question": "What is the initial climb altitude?",
        "options": ["FL350", "FL70", "FL150", "3,000 feet"],
        "correct_index": 1,
        "explanation": "The clearance says 'climb initially to FL70'. FL350 is the expected cruise level, not the initial climb."
      }
    },
    {
      "order_index": 4,
      "type": "fill_blank",
      "content": {
        "prompt": "EZY123, cleared to London Heathrow via flight planned route. Climb initially to _____, squawk _____.",
        "blanks": ["FL70", "2341"],
        "context": "ATC is issuing your IFR departure clearance."
      }
    },
    {
      "order_index": 5,
      "type": "complete_phrase",
      "content": {
        "atc_text": "EZY123, push and start approved, face south.",
        "correct_response": "Push and start approved, face south, EZY123.",
        "hint": "Readback the push direction and your callsign.",
        "acceptable_variants": ["Approved push and start facing south, EZY123.", "Push start face south, EZY123."]
      }
    }
  ]
}
```

- [ ] **Step 6: Commit**

```bash
git add content/
git commit -m "feat: content files for Cessna 172 and A320neo"
```

---

## Task 10: Database Seed Script

**Files:**
- Create: `supabase/seed.ts`

- [ ] **Step 1: Write seed script**

Create `supabase/seed.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs service role for seeding
)

async function seed() {
  const contentDir = path.join(process.cwd(), 'content/aircraft')
  const aircraftDirs = fs.readdirSync(contentDir)

  for (const slug of aircraftDirs) {
    const metaPath = path.join(contentDir, slug, 'meta.json')
    if (!fs.existsSync(metaPath)) continue
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    // Upsert aircraft
    const { data: aircraft, error: aircraftError } = await supabase
      .from('aircraft')
      .upsert({ ...meta, slug }, { onConflict: 'slug' })
      .select()
      .single()

    if (aircraftError) { console.error(`Aircraft error for ${slug}:`, aircraftError); continue }
    console.log(`✓ Aircraft: ${aircraft.name}`)

    // Load lessons
    const lessonsDir = path.join(contentDir, slug, 'lessons')
    if (!fs.existsSync(lessonsDir)) continue
    const lessonFiles = fs.readdirSync(lessonsDir).sort()

    for (const lessonFile of lessonFiles) {
      const lessonData = JSON.parse(fs.readFileSync(path.join(lessonsDir, lessonFile), 'utf8'))
      const { exercises, ...lessonMeta } = lessonData

      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .upsert({ ...lessonMeta, aircraft_id: aircraft.id }, { onConflict: 'aircraft_id,order_index' })
        .select()
        .single()

      if (lessonError) { console.error(`Lesson error:`, lessonError); continue }
      console.log(`  ✓ Lesson: ${lesson.title}`)

      for (const ex of exercises) {
        const { error: exError } = await supabase
          .from('exercises')
          .upsert({ ...ex, lesson_id: lesson.id }, { onConflict: 'lesson_id,order_index' })

        if (exError) console.error(`Exercise error:`, exError)
      }
      console.log(`    ✓ ${exercises.length} exercises seeded`)
    }
  }

  // Seed achievements
  const achievements = [
    { name: 'First Flight', description: 'Complete your first lesson', icon: '🛫', criteria: { type: 'lessons_completed', value: 1 } },
    { name: '7-Day Streak', description: '7 consecutive days of training', icon: '🔥', criteria: { type: 'streak', value: 7 } },
    { name: 'Cessna Certified', description: 'Complete all Cessna 172 lessons', icon: '🏆', criteria: { type: 'aircraft_complete', value: 'cessna-172' } },
    { name: 'Cleared for Takeoff', description: 'Complete your first simulation', icon: '🎙️', criteria: { type: 'simulations_completed', value: 1 } },
    { name: 'Top Gun', description: 'Complete all military aircraft lessons', icon: '⚡', criteria: { type: 'category_complete', value: 'Military' } },
    { name: 'Perfect Approach', description: '5 perfect lesson scores in a row', icon: '💯', criteria: { type: 'perfect_streak', value: 5 } },
  ]

  for (const a of achievements) {
    const { error } = await supabase.from('achievements').upsert(a, { onConflict: 'name' })
    if (error) console.error('Achievement error:', error)
    else console.log(`✓ Achievement: ${a.name}`)
  }

  console.log('\nSeed complete!')
}

seed().catch(console.error)
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add to `"scripts"`:
```json
"seed": "ts-node -r tsconfig-paths/register supabase/seed.ts"
```

```bash
npm install -D ts-node tsconfig-paths
```

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (from Supabase dashboard → Settings → API → service_role key).

- [ ] **Step 3: Run seed**

```bash
npm run seed
```

Expected output:
```
✓ Aircraft: Cessna 172
  ✓ Lesson: Ground Communication
    ✓ 7 exercises seeded
  ✓ Lesson: Departure & Takeoff
    ✓ 7 exercises seeded
✓ Aircraft: Airbus A320neo
  ...
✓ Achievement: First Flight
...
Seed complete!
```

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.ts package.json
git commit -m "feat: database seed script for aircraft, lessons, exercises, achievements"
```

---

## Task 11: Dashboard Page

**Files:**
- Create: `components/dashboard/AircraftCard.tsx`
- Create: `components/dashboard/StreakBanner.tsx`
- Create: `components/dashboard/XPBar.tsx`
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: AircraftCard component**

Create `components/dashboard/AircraftCard.tsx`:
```tsx
import Link from 'next/link'
import { Aircraft } from '@/types'

interface AircraftCardProps {
  aircraft: Aircraft
  isUnlocked: boolean
  completedLessons: number
  totalLessons: number
}

export function AircraftCard({ aircraft, isUnlocked, completedLessons, totalLessons }: AircraftCardProps) {
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (!isUnlocked) {
    return (
      <div className="relative p-5 rounded-2xl bg-slate-800 border border-slate-700 opacity-60 cursor-not-allowed select-none">
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/60 z-10">
          <span className="text-4xl">🔒</span>
        </div>
        <p className="text-sm text-slate-500 font-medium">{aircraft.category}</p>
        <h3 className="text-lg font-bold text-white mt-1">{aircraft.name}</h3>
        <p className="text-xs text-slate-500 mt-1">Unlock at level {aircraft.unlock_level}</p>
      </div>
    )
  }

  return (
    <Link href={`/aircraft/${aircraft.slug}`}>
      <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-sky-500 transition-colors cursor-pointer">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide">{aircraft.category}</p>
        <h3 className="text-lg font-bold text-white mt-1">{aircraft.name}</h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{aircraft.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: StreakBanner component**

Create `components/dashboard/StreakBanner.tsx`:
```tsx
interface StreakBannerProps {
  streakCount: number
}

export function StreakBanner({ streakCount }: StreakBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
      <span className="text-2xl">🔥</span>
      <div>
        <p className="text-orange-400 font-bold text-lg leading-none">{streakCount}</p>
        <p className="text-orange-300 text-xs">day streak</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: XPBar component**

Create `components/dashboard/XPBar.tsx`:
```tsx
import { getXPProgress, getLevelFromXP } from '@/lib/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface XPBarProps {
  totalXP: number
}

export function XPBar({ totalXP }: XPBarProps) {
  const level = getLevelFromXP(totalXP)
  const { current, next, percent } = getXPProgress(totalXP)
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar percent={percent} />
        <p className="text-xs text-slate-400 mt-1">
          {next ? `${current} / ${next} XP` : 'Max level reached'}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Dashboard page (server component)**

Create `app/dashboard/page.tsx`:
```tsx
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
    <main className="min-h-screen bg-slate-900 px-4 py-8 max-w-2xl mx-auto">
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
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ app/dashboard/
git commit -m "feat: dashboard page with aircraft cards, XP bar, and streak"
```

---

## Task 12: Aircraft Course Page

**Files:**
- Create: `app/aircraft/[slug]/page.tsx`

- [ ] **Step 1: Course overview page**

Create `app/aircraft/[slug]/page.tsx`:
```tsx
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

      {/* Simulation card */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/aircraft/
git commit -m "feat: aircraft course overview page with lesson list and simulation unlock"
```

---

## Task 13: Lesson Engine Core

**Files:**
- Create: `app/aircraft/[slug]/lesson/[id]/page.tsx`
- Create: `components/lesson/LessonProgress.tsx`
- Create: `components/lesson/LessonComplete.tsx`
- Create: `app/api/progress/route.ts`

- [ ] **Step 1: Progress API route**

Create `app/api/progress/route.ts`:
```ts
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

  // Upsert progress (don't double-count)
  const { error: progressError } = await supabase.from('user_progress').upsert(
    { user_id: user.id, lesson_id: lessonId, xp_earned: xpEarned, score },
    { onConflict: 'user_id,lesson_id' }
  )
  if (progressError) return NextResponse.json({ error: progressError.message }, { status: 500 })

  // Update user XP, level, streak
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
```

- [ ] **Step 2: LessonProgress component**

Create `components/lesson/LessonProgress.tsx`:
```tsx
interface LessonProgressProps {
  current: number
  total: number
}

export function LessonProgress({ current, total }: LessonProgressProps) {
  const percent = Math.round((current / total) * 100)
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 bg-slate-700 rounded-full h-3">
        <div className="bg-sky-500 h-3 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-slate-400 text-sm shrink-0">{current}/{total}</span>
    </div>
  )
}
```

- [ ] **Step 3: LessonComplete component**

Create `components/lesson/LessonComplete.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface LessonCompleteProps {
  xpEarned: number
  score: number
  aircraftSlug: string
}

export function LessonComplete({ xpEarned, score, aircraftSlug }: LessonCompleteProps) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl mb-6">🏆</div>
      <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
      <p className="text-slate-400 mb-6">Great work, pilot.</p>
      <div className="flex gap-6 mb-8">
        <div className="bg-slate-800 rounded-2xl px-6 py-4">
          <p className="text-sky-400 text-2xl font-bold">+{xpEarned}</p>
          <p className="text-slate-400 text-sm">XP earned</p>
        </div>
        <div className="bg-slate-800 rounded-2xl px-6 py-4">
          <p className="text-green-400 text-2xl font-bold">{score}%</p>
          <p className="text-slate-400 text-sm">Score</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push(`/aircraft/${aircraftSlug}`)}>
          Back to Course
        </Button>
        <Button onClick={() => router.push('/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Lesson page**

Create `app/aircraft/[slug]/lesson/[id]/page.tsx`:
```tsx
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
```

- [ ] **Step 5: LessonClient (client component orchestrator)**

Create `app/aircraft/[slug]/lesson/[id]/LessonClient.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { LessonProgress } from '@/components/lesson/LessonProgress'
import { LessonComplete } from '@/components/lesson/LessonComplete'
import { VocabularyCard } from '@/components/lesson/exercises/VocabularyCard'
import { ListenChoose } from '@/components/lesson/exercises/ListenChoose'
import { FillBlank } from '@/components/lesson/exercises/FillBlank'
import { CompletePhrase } from '@/components/lesson/exercises/CompletePhrase'
import { Exercise, Lesson } from '@/types'

interface Props {
  lesson: Lesson
  exercises: Exercise[]
  aircraftSlug: string
}

export function LessonClient({ lesson, exercises, aircraftSlug }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  const current = exercises[currentIndex]

  async function handleNext(wasCorrect: boolean) {
    if (!wasCorrect) setWrongCount(c => c + 1)

    if (currentIndex + 1 >= exercises.length) {
      const totalScore = Math.round(((exercises.length - wrongCount - (wasCorrect ? 0 : 1)) / exercises.length) * 100)
      const isPerfect = wrongCount === 0 && wasCorrect

      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id, score: totalScore, isPerfect }),
      })
      const data = await res.json()
      setXpEarned(data.xpEarned)
      setIsComplete(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  if (isComplete) {
    const score = Math.round(((exercises.length - wrongCount) / exercises.length) * 100)
    return <LessonComplete xpEarned={xpEarned} score={score} aircraftSlug={aircraftSlug} />
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-white font-semibold mb-3">{lesson.title}</h2>
        <LessonProgress current={currentIndex} total={exercises.length} />
      </div>

      {current.type === 'vocabulary' && (
        <VocabularyCard content={current.content as any} onNext={() => handleNext(true)} />
      )}
      {current.type === 'listen_choose' && (
        <ListenChoose content={current.content as any} onNext={handleNext} />
      )}
      {current.type === 'fill_blank' && (
        <FillBlank content={current.content as any} onNext={handleNext} />
      )}
      {current.type === 'complete_phrase' && (
        <CompletePhrase content={current.content as any} onNext={handleNext} />
      )}
    </main>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/aircraft/ app/api/progress/ components/lesson/
git commit -m "feat: lesson engine core with progress tracking and XP award"
```

---

## Task 14: Exercise Components

**Files:**
- Create: `components/lesson/exercises/VocabularyCard.tsx`
- Create: `components/lesson/exercises/ListenChoose.tsx`
- Create: `components/lesson/exercises/FillBlank.tsx`
- Create: `components/lesson/exercises/CompletePhrase.tsx`
- Create: `__tests__/components/exercises/FillBlank.test.tsx`

- [ ] **Step 1: VocabularyCard**

Create `components/lesson/exercises/VocabularyCard.tsx`:
```tsx
import { VocabularyContent } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props { content: VocabularyContent; onNext: () => void }

export function VocabularyCard({ content, onNext }: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide mb-2">New Term</p>
        <h3 className="text-3xl font-bold text-white mb-3">{content.term}</h3>
        <p className="text-slate-300 leading-relaxed">{content.definition}</p>
      </div>
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60">
        <p className="text-xs text-slate-500 mb-2">ATC says:</p>
        <p className="text-sky-300 italic">"{content.example_atc}"</p>
        <p className="text-xs text-slate-500 mt-3 mb-2">You respond:</p>
        <p className="text-green-300 italic">"{content.example_response}"</p>
      </div>
      <Button className="w-full" onClick={onNext}>Got it →</Button>
    </div>
  )
}
```

- [ ] **Step 2: ListenChoose**

Create `components/lesson/exercises/ListenChoose.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'
import { ListenChooseContent } from '@/types'
import { speakATC } from '@/lib/speech'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { content: ListenChooseContent; onNext: (correct: boolean) => void }

export function ListenChoose({ content, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    speakATC(content.atc_text)
  }, [content.atc_text])

  function handleSelect(index: number) {
    if (revealed) return
    setSelected(index)
    setRevealed(true)
  }

  const isCorrect = selected === content.correct_index

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1">ATC transmission:</p>
        <p className="text-sky-300 italic text-lg">"{content.atc_text}"</p>
        <button
          onClick={() => speakATC(content.atc_text)}
          className="mt-3 text-xs text-slate-400 hover:text-sky-400 transition-colors"
        >
          🔊 Replay
        </button>
      </div>

      <p className="text-white font-semibold">{content.question}</p>

      <div className="space-y-2">
        {content.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border transition-colors',
              !revealed && 'bg-slate-800 border-slate-700 hover:border-sky-500 text-white',
              revealed && i === content.correct_index && 'bg-green-500/20 border-green-500 text-green-300',
              revealed && i === selected && i !== content.correct_index && 'bg-red-500/20 border-red-500 text-red-300',
              revealed && i !== selected && i !== content.correct_index && 'bg-slate-800 border-slate-700 text-slate-500'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {revealed && (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-slate-300 text-sm mt-1">{content.explanation}</p>
          <Button className="mt-3 w-full" onClick={() => onNext(isCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write FillBlank test**

Create `__tests__/components/exercises/FillBlank.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FillBlank } from '@/components/lesson/exercises/FillBlank'

const content = {
  prompt: 'N172SP, _____ 28, cleared for _____.',
  blanks: ['runway', 'takeoff'],
  context: 'ATC is giving you a takeoff clearance.',
}

describe('FillBlank', () => {
  it('renders the prompt with inputs', () => {
    render(<FillBlank content={content} onNext={jest.fn()} />)
    expect(screen.getByText(/ATC is giving you a takeoff clearance/)).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('marks correct answers as correct', () => {
    render(<FillBlank content={content} onNext={jest.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'runway' } })
    fireEvent.change(inputs[1], { target: { value: 'takeoff' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/correct/i)).toBeInTheDocument()
  })

  it('calls onNext with true for all-correct answers', () => {
    const onNext = jest.fn()
    render(<FillBlank content={content} onNext={onNext} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'runway' } })
    fireEvent.change(inputs[1], { target: { value: 'takeoff' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledWith(true)
  })

  it('calls onNext with false for wrong answers', () => {
    const onNext = jest.fn()
    render(<FillBlank content={content} onNext={onNext} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'taxiway' } })
    fireEvent.change(inputs[1], { target: { value: 'landing' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 4: Run FillBlank tests to confirm they fail**

```bash
npx jest __tests__/components/exercises/FillBlank.test.tsx
```
Expected: FAIL — `Cannot find module`

- [ ] **Step 5: FillBlank component**

Create `components/lesson/exercises/FillBlank.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { FillBlankContent } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { content: FillBlankContent; onNext: (correct: boolean) => void }

export function FillBlank({ content, onNext }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [revealed, setRevealed] = useState(false)

  const parts = content.prompt.split('_____')

  function handleCheck() {
    setRevealed(true)
  }

  const isAllCorrect = answers.every(
    (a, i) => a.trim().toLowerCase() === content.blanks[i].toLowerCase()
  )

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-2">{content.context}</p>
        <div className="flex flex-wrap items-center gap-1 text-white text-lg">
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <span>{part}</span>
              {i < content.blanks.length && (
                <input
                  type="text"
                  value={answers[i]}
                  onChange={e => {
                    const next = [...answers]
                    next[i] = e.target.value
                    setAnswers(next)
                  }}
                  disabled={revealed}
                  className={cn(
                    'inline-block w-28 px-2 py-1 rounded-lg border text-center text-sm',
                    !revealed && 'bg-slate-700 border-sky-500 text-white focus:outline-none',
                    revealed && answers[i].trim().toLowerCase() === content.blanks[i].toLowerCase()
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : revealed
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : ''
                  )}
                />
              )}
            </span>
          ))}
        </div>
      </div>

      {!revealed ? (
        <Button className="w-full" onClick={handleCheck} disabled={answers.some(a => !a.trim())}>
          Check
        </Button>
      ) : (
        <div className={`rounded-xl p-4 ${isAllCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isAllCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isAllCorrect ? '✅ Correct!' : `❌ Correct answers: ${content.blanks.join(', ')}`}
          </p>
          <Button className="mt-3 w-full" onClick={() => onNext(isAllCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run FillBlank tests**

```bash
npx jest __tests__/components/exercises/FillBlank.test.tsx
```
Expected: PASS — 4 tests passing.

- [ ] **Step 7: CompletePhrase component**

Create `components/lesson/exercises/CompletePhrase.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { CompletePhraseContent } from '@/types'
import { speakATC } from '@/lib/speech'
import { Button } from '@/components/ui/Button'

interface Props { content: CompletePhraseContent; onNext: (correct: boolean) => void }

export function CompletePhrase({ content, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/[.,]/g, '')
  }

  function check() {
    setRevealed(true)
  }

  const isCorrect = [content.correct_response, ...content.acceptable_variants]
    .some(v => normalize(v) === normalize(answer))

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1">ATC says:</p>
        <p className="text-sky-300 italic text-lg">"{content.atc_text}"</p>
        <button onClick={() => speakATC(content.atc_text)} className="mt-2 text-xs text-slate-400 hover:text-sky-400">
          🔊 Replay
        </button>
      </div>

      <p className="text-white font-semibold">Type your pilot readback:</p>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={revealed}
        placeholder="Type your response here…"
        rows={3}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
      />

      {!showHint && !revealed && (
        <button onClick={() => setShowHint(true)} className="text-xs text-slate-400 hover:text-sky-400">
          💡 Show hint
        </button>
      )}
      {showHint && !revealed && (
        <p className="text-slate-400 text-sm italic">{content.hint}</p>
      )}

      {!revealed ? (
        <Button className="w-full" onClick={check} disabled={!answer.trim()}>Check</Button>
      ) : (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/40' : 'bg-red-500/10 border border-red-500/40'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Not quite'}
          </p>
          {!isCorrect && (
            <p className="text-slate-300 text-sm mt-1">Expected: <span className="text-green-300">"{content.correct_response}"</span></p>
          )}
          <Button className="mt-3 w-full" onClick={() => onNext(isCorrect)}>Continue →</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/lesson/exercises/ __tests__/
git commit -m "feat: all four exercise components (vocabulary, listen, fill, complete)"
```

---

## Task 15: Gemini Simulation

**Files:**
- Create: `lib/gemini.ts`
- Create: `app/api/simulation/route.ts`
- Create: `components/simulation/SimulationChat.tsx`
- Create: `app/aircraft/[slug]/simulation/page.tsx`

- [ ] **Step 1: Gemini client wrapper**

Create `lib/gemini.ts`:
```ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  })
}

export function buildATCSystemPrompt(aircraftName: string, scenario: 'departure' | 'arrival'): string {
  return `You are an ATC controller at a busy international airport. The pilot is flying a ${aircraftName}.
Conduct a realistic ${scenario} ATC scenario.
Format each message as: [YOUR ATC TRANSMISSION]
After the pilot responds, evaluate their readback on a new line as: [Evaluation: Correct | Partially correct | Incorrect: reason]
Then continue the scenario with your next ATC instruction.
Keep transmissions realistic and concise. Use standard ICAO phraseology.
After 6-8 exchanges, end the scenario with: [SCENARIO COMPLETE]`
}
```

- [ ] **Step 2: Simulation API route**

Create `app/api/simulation/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getGeminiModel, buildATCSystemPrompt } from '@/lib/gemini'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { aircraftName, scenario, history } = await request.json() as {
    aircraftName: string
    scenario: 'departure' | 'arrival'
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
  }

  try {
    const model = getGeminiModel()
    const systemPrompt = buildATCSystemPrompt(aircraftName, scenario)

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. Initiating ATC scenario.' }] },
        ...history,
      ],
    })

    const result = await chat.sendMessage(
      history.length === 0
        ? 'Begin the scenario with your first ATC transmission.'
        : history[history.length - 1].parts[0].text
    )

    return NextResponse.json({ text: result.response.text() })
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })
  }
}
```

- [ ] **Step 3: SimulationChat component**

Create `components/simulation/SimulationChat.tsx`:
```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { speakATC, cancelSpeech } from '@/lib/speech'
import { Button } from '@/components/ui/Button'
import { SimulationMessage } from '@/types'

interface Props {
  aircraftName: string
  aircraftSlug: string
}

export function SimulationChat({ aircraftName, aircraftSlug }: Props) {
  const [messages, setMessages] = useState<SimulationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [scenario] = useState<'departure' | 'arrival'>('departure')
  const [history, setHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { startScenario() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function callAPI(updatedHistory: typeof history) {
    setLoading(true)
    const res = await fetch('/api/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aircraftName, scenario, history: updatedHistory }),
    })
    const data = await res.json()
    setLoading(false)
    return data.text as string
  }

  async function startScenario() {
    const text = await callAPI([])
    setHistory([{ role: 'model', parts: [{ text }] }])
    setMessages([{ role: 'atc', text }])
    speakATC(text.replace(/\[.*?\]/g, '').trim())
    if (text.includes('[SCENARIO COMPLETE]')) setIsComplete(true)
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    const pilotMessage = input.trim()
    setInput('')
    cancelSpeech()

    const newHistory = [
      ...history,
      { role: 'user' as const, parts: [{ text: pilotMessage }] },
    ]

    setMessages(m => [...m, { role: 'pilot', text: pilotMessage }])
    setHistory(newHistory)

    const atcResponse = await callAPI(newHistory)
    const updatedHistory = [...newHistory, { role: 'model' as const, parts: [{ text: atcResponse }] }]
    setHistory(updatedHistory)
    setMessages(m => [...m, { role: 'atc', text: atcResponse }])
    speakATC(atcResponse.replace(/\[.*?\]/g, '').trim())
    if (atcResponse.includes('[SCENARIO COMPLETE]')) setIsComplete(true)
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'pilot' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'atc'
                ? 'bg-slate-800 border border-slate-700 text-sky-300'
                : 'bg-sky-600 text-white'
            }`}>
              <p className="text-xs font-semibold mb-1 opacity-60">
                {msg.role === 'atc' ? '🗼 ATC' : '✈️ You'}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
              <p className="text-sky-400 text-sm">ATC is transmitting…</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isComplete ? (
        <div className="text-center py-4">
          <p className="text-green-400 font-semibold mb-3">Simulation complete! Well done, pilot.</p>
          <Button onClick={() => window.location.reload()}>New Scenario</Button>
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-slate-700">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your readback…"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Simulation page**

Create `app/aircraft/[slug]/simulation/page.tsx`:
```tsx
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

  if (!aircraft) notFound()

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
```

- [ ] **Step 5: Commit**

```bash
git add lib/gemini.ts app/api/simulation/ components/simulation/ app/aircraft/
git commit -m "feat: Gemini-powered ATC conversation simulation"
```

---

## Task 16: Profile Page + Root Layout

**Files:**
- Create: `app/profile/page.tsx`
- Modify: `app/layout.tsx`
- Create: `app/page.tsx` (landing)

- [ ] **Step 1: Root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cleard Speak Aviation',
  description: 'Learn ATC communication for VATSIM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Landing page**

Replace `app/page.tsx`:
```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
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
```

- [ ] **Step 3: Profile page**

Create `app/profile/page.tsx`:
```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx app/profile/
git commit -m "feat: landing page, root layout, and profile page"
```

---

## Task 17: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npx jest
```
Expected: All tests pass.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Start dev server and verify flows**

```bash
npm run dev
```

Manually test these flows:
1. `/` — landing page renders
2. `/auth/register` — create an account → redirects to `/dashboard`
3. `/dashboard` — shows Cessna 172 (unlocked), A320neo (locked until level 2)
4. `/aircraft/cessna-172` — shows 2 lessons
5. `/aircraft/cessna-172/lesson/[id]` — complete all exercises, check XP is awarded
6. After 5 lessons: `/aircraft/cessna-172/simulation` — AI chat works
7. `/profile` — stats and achievements shown

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: final verification pass"
```

---

## Deployment (optional, when ready)

1. Push to GitHub
2. Go to https://vercel.com → Import repository
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
4. Deploy — Vercel auto-detects Next.js
