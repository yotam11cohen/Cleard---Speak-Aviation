import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const contentDir = path.join(process.cwd(), 'content/aircraft')
  const aircraftDirs = fs.readdirSync(contentDir)

  for (const slug of aircraftDirs) {
    const metaPath = path.join(contentDir, slug, 'meta.json')
    if (!fs.existsSync(metaPath)) continue
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    const { data: aircraft, error: aircraftError } = await supabase
      .from('aircraft')
      .upsert({ ...meta, slug }, { onConflict: 'slug' })
      .select()
      .single()

    if (aircraftError) { console.error(`Aircraft error for ${slug}:`, aircraftError); continue }
    console.log(`✓ Aircraft: ${aircraft.name}`)

    const lessonsDir = path.join(contentDir, slug, 'lessons')
    if (!fs.existsSync(lessonsDir)) continue
    const lessonFiles = fs.readdirSync(lessonsDir).sort()

    // Delete existing lessons for this aircraft (cascades to exercises)
    await supabase.from('lessons').delete().eq('aircraft_id', aircraft.id)

    for (const lessonFile of lessonFiles) {
      const lessonData = JSON.parse(fs.readFileSync(path.join(lessonsDir, lessonFile), 'utf8'))
      const { exercises, ...lessonMeta } = lessonData

      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({ ...lessonMeta, aircraft_id: aircraft.id })
        .select()
        .single()

      if (lessonError) { console.error(`Lesson error:`, lessonError); continue }
      console.log(`  ✓ Lesson: ${lesson.title}`)

      const { error: exError } = await supabase
        .from('exercises')
        .insert(exercises.map((ex: Record<string, unknown>) => ({ ...ex, lesson_id: lesson.id })))
      if (exError) console.error(`Exercise error:`, exError)
      else console.log(`    ✓ ${exercises.length} exercises seeded`)
    }
  }

  const achievements: { name: string; description: string; icon: string; criteria: { type: string; value: string | number } }[] = [
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
