import type { Course, Lesson } from '@/payload-types'

/** The signed-in learner, once Supabase sign-in lands (milestone 4). */
export type Learner = { id: string } | null

/**
 * Single place that decides whether someone may see a lesson's body and video.
 * Today: free previews and lessons in free courses are open to everyone.
 * Later milestones add enrollments and subscriptions here.
 */
export function canAccessLesson({
  lesson,
  course,
}: {
  lesson: Pick<Lesson, 'isFree'>
  course: Pick<Course, 'priceMode'>
  learner?: Learner
}): boolean {
  if (lesson.isFree) return true
  if (course.priceMode === 'free') return true
  return false
}
