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
