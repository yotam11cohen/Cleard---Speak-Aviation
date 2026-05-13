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
