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
