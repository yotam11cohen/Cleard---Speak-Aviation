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
  name text unique not null,
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
