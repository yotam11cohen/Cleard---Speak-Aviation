# Cleard Speak Aviation — Design Spec
**Date:** 2026-05-13  
**Status:** Approved  
**Stack:** Next.js 14 + Supabase + Gemini API (free tier) + Web Speech API

---

## 1. Overview

A Duolingo-style web app for learning aviation radio telephony (ATC communication). Users learn to speak and understand the language used between pilots and air traffic control, preparing them for VATSIM flight simulation. Courses are organized around aircraft types; each aircraft is a "language" to master.

**Target user:** Flight sim enthusiast preparing for VATSIM, zero prior ATC knowledge.

---

## 2. Architecture

```
┌─────────────────────────────────────────┐
│           Next.js 14 (App Router)        │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   Frontend   │  │   API Routes     │ │
│  │  (React UI)  │  │  (/api/*)        │ │
│  └──────────────┘  └──────────────────┘ │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐         ┌────────▼──────┐
│   Supabase   │         │  Gemini API   │
│  ─ Auth      │         │  (free tier)  │
│  ─ PostgreSQL│         │  ─ simulation │
│  ─ Storage   │         │  ─ variations │
└──────────────┘         └───────────────┘

Audio: Web Speech API (browser built-in, free)
```

**Deployment:** Vercel (free hobby tier) + Supabase (free tier)  
**Total monthly cost: $0**

---

## 3. Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — app intro, CTA to sign up |
| `/auth/login` | Login: email/password + Google OAuth |
| `/auth/register` | Register: display name + email/password |
| `/dashboard` | Main hub: aircraft grid, streak, XP bar, level |
| `/aircraft/[slug]` | Course overview: lesson list with progress |
| `/aircraft/[slug]/lesson/[id]` | Active lesson: sequential exercises |
| `/aircraft/[slug]/simulation` | Full conversation simulation (unlocked after 5 lessons) |
| `/profile` | User stats, achievements, streak history |

---

## 4. Data Model (Supabase PostgreSQL)

### `users` (extends Supabase Auth)
```
id            uuid PK (from auth.users)
display_name  text
avatar_url    text
total_xp      integer  default 0
level         integer  default 1
streak_count  integer  default 0
last_active   date
```

### `aircraft`
```
id            uuid PK
name          text          -- "Cessna 172"
slug          text unique   -- "cessna-172"
category      enum(GA, Commercial, Military)
description   text
icon_url      text
unlock_level  integer       -- minimum level required
order_index   integer       -- display order in dashboard
```

### `lessons`
```
id            uuid PK
aircraft_id   uuid FK → aircraft.id
order_index   integer
title         text
description   text
type          enum(lesson, simulation)
xp_reward     integer default 10
```

### `exercises`
```
id            uuid PK
lesson_id     uuid FK → lessons.id
order_index   integer
type          enum(listen_choose, fill_blank, complete_phrase, vocabulary)
content       jsonb   -- see Exercise Content Schema below
```

### `user_progress`
```
id            uuid PK
user_id       uuid FK → users.id
lesson_id     uuid FK → lessons.id
completed_at  timestamptz
xp_earned     integer
score         integer  -- 0-100
```

### `achievements`
```
id            uuid PK
name          text
description   text
icon          text       -- emoji or icon name
criteria      jsonb      -- { type: "streak", value: 7 }
```

### `user_achievements`
```
user_id       uuid FK → users.id
achievement_id uuid FK → achievements.id
earned_at     timestamptz
PRIMARY KEY (user_id, achievement_id)
```

---

## 5. Exercise Content Schema (JSONB)

Each exercise type has a defined `content` shape:

**`listen_choose`** — hear ATC audio, pick correct meaning/readback:
```json
{
  "atc_text": "N172SP, runway 28, cleared for takeoff.",
  "question": "What did ATC clear you to do?",
  "options": ["Land on runway 28", "Take off from runway 28", "Hold short of runway 28", "Taxi to runway 28"],
  "correct_index": 1,
  "explanation": "Cleared for takeoff means you are authorized to begin your takeoff roll."
}
```

**`fill_blank`** — complete a clearance with missing words:
```json
{
  "prompt": "N172SP, _____ 28, cleared for _____.",
  "blanks": ["runway", "takeoff"],
  "context": "ATC is giving you takeoff clearance on runway 28."
}
```

**`complete_phrase`** — type the correct pilot readback:
```json
{
  "atc_text": "N172SP, contact departure 119.1.",
  "correct_response": "Contact departure 119.1, N172SP.",
  "hint": "Read back the frequency and your callsign.",
  "acceptable_variants": ["Departure 119.1, N172SP.", "119.1, N172SP."]
}
```

**`vocabulary`** — term card:
```json
{
  "term": "Squawk",
  "definition": "Set your transponder to a specific 4-digit code assigned by ATC.",
  "example_atc": "N172SP, squawk 4521.",
  "example_response": "Squawk 4521, N172SP."
}
```

---

## 6. Aircraft & Unlock System

| Level | XP Required | Aircraft Unlocked |
|-------|-------------|-------------------|
| 1 | 0 | Cessna 172 |
| 2 | 500 | Airbus A320neo |
| 3 | 1,500 | Boeing 737 |
| 4 | 3,000 | F-16, F-15 |
| 5 | 6,000 | F/A-18 + more |

Each aircraft has 8–12 lessons covering:
- Ground communication (pushback, taxi)
- Departure (clearance delivery, takeoff)
- En-route (handoffs, weather, position reports)
- Arrival (approach, landing clearance)
- Emergencies (mayday, pan-pan)
- VATSIM-specific procedures

---

## 7. Lesson Engine

A lesson contains 6–10 exercises shown sequentially:
1. User completes exercise → immediate feedback (correct/wrong + explanation)
2. Wrong answer → shown correct answer, no XP penalty but noted for review
3. All exercises done → lesson complete screen (XP earned, streak update)
4. Progress saved to `user_progress`

Exercise type distribution per lesson (varied, not fixed):
- ~2 vocabulary cards (always first, to introduce terms)
- ~2 listen_choose
- ~2 fill_blank
- ~2 complete_phrase

---

## 8. Conversation Simulation (AI)

Unlocked after completing 5 lessons in an aircraft.

**Flow:**
1. Gemini API generates a realistic scenario (airport, weather, callsign)
2. Gemini plays ATC controller in a multi-turn conversation
3. User types pilot readbacks
4. After each user response, Gemini evaluates correctness and continues
5. End of simulation: score + detailed feedback per transmission

**Gemini prompt structure:**
- System: "You are an ATC controller at [airport]. The pilot is flying [aircraft]. Conduct a realistic [departure/arrival] scenario. After each pilot response, evaluate it briefly (Correct / Partially correct / Incorrect: [reason]) then continue the scenario."
- Temperature: 0.7 for realism variation

**Fallback:** If Gemini API is unavailable, show a pre-scripted simulation from the database.

---

## 9. Audio (Web Speech API)

All ATC audio is generated client-side using the browser's `SpeechSynthesis` API:
- Voice: `en-US` with slight pitch/rate adjustments to mimic radio quality
- Triggered on exercise load for `listen_choose` type
- User can replay audio with a button
- No server calls, no cost, works offline

---

## 10. Gamification

### XP & Levels
- +10 XP per completed lesson
- +5 XP per simulation completed
- Bonus +5 XP for perfect lesson score (0 wrong answers)
- Level thresholds: 0 / 500 / 1500 / 3000 / 6000 XP

### Streak
- Tracked by `last_active` date on `users`
- Streak increments if user completes at least 1 lesson today
- Streak resets if a day is missed (no grace period for MVP)
- Displayed prominently on dashboard with flame icon

### Achievements (Badges)
| Badge | Criteria |
|-------|----------|
| First Flight | Complete first lesson |
| 7-Day Streak | 7 consecutive days |
| Cessna Certified | Complete all Cessna 172 lessons |
| Cleared for Takeoff | Complete first simulation |
| Top Gun | Complete all military aircraft lessons |
| Perfect Approach | 5 perfect lesson scores in a row |

---

## 11. Authentication

Supabase Auth handles all authentication:
- **Email/password**: standard register + login
- **Google OAuth**: one-click via Supabase provider
- Session managed by Supabase client SDK (cookie-based)
- Protected routes redirect to `/auth/login` if no session

---

## 12. Content Management

**Initial content:** Written manually as JSON seed files, imported into Supabase via migration scripts.

**AI-assisted variation:** Gemini API can generate additional exercise variants from a base template (used offline by developer to expand content, not at runtime for exercises).

**Content structure in repo:**
```
content/
  aircraft/
    cessna-172/
      meta.json
      lessons/
        01-ground-communication.json
        02-departure.json
        ...
    a320neo/
      ...
```

---

## 13. Tech Stack Summary

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14 (App Router, React) | Free |
| Styling | Tailwind CSS | Free |
| Auth | Supabase Auth (email + Google) | Free tier |
| Database | Supabase PostgreSQL | Free tier |
| File Storage | Supabase Storage (if needed) | Free tier |
| AI | Google Gemini 1.5 Flash API | Free tier |
| Audio | Web Speech API (browser) | Free |
| Deployment | Vercel | Free hobby |
| **Total** | | **$0/month** |

---

## 14. Out of Scope (MVP)

- Mobile app
- Voice input (speech recognition for pilot responses)
- Multiplayer / ATC role
- Paid subscription / premium content
- Push notifications
- Offline mode
