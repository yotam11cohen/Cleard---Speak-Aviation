'use client'
import { useState } from 'react'
import { LessonProgress } from '@/components/lesson/LessonProgress'
import { LessonComplete } from '@/components/lesson/LessonComplete'
import { VocabularyCard } from '@/components/lesson/exercises/VocabularyCard'
import { ListenChoose } from '@/components/lesson/exercises/ListenChoose'
import { FillBlank } from '@/components/lesson/exercises/FillBlank'
import { CompletePhrase } from '@/components/lesson/exercises/CompletePhrase'
import { Exercise, Lesson, VocabularyContent, ListenChooseContent, FillBlankContent, CompletePhraseContent } from '@/types'

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
        <VocabularyCard content={current.content as VocabularyContent} onNext={() => handleNext(true)} />
      )}
      {current.type === 'listen_choose' && (
        <ListenChoose content={current.content as ListenChooseContent} onNext={handleNext} />
      )}
      {current.type === 'fill_blank' && (
        <FillBlank content={current.content as FillBlankContent} onNext={handleNext} />
      )}
      {current.type === 'complete_phrase' && (
        <CompletePhrase content={current.content as CompletePhraseContent} onNext={handleNext} />
      )}
    </main>
  )
}
