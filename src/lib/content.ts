import 'server-only'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { canAccessLesson, type Learner } from '@/lib/access'
import type { Course, Lesson, Module, MuxVideo } from '@/payload-types'

const payload = () => getPayload({ config: configPromise })

const published: Where = { _status: { equals: 'published' } }

export type CourseFilters = {
  q?: string
  language?: Course['language']
  level?: Course['level']
}

/** Published courses, newest first. Leave `limit` out to get every match (the catalog page). */
export async function getCourses({ q, language, level }: CourseFilters = {}, limit?: number) {
  const and: Where[] = [published]
  if (q) {
    and.push({
      or: [{ title: { like: q } }, { summary: { like: q } }, { tags: { contains: q } }],
    })
  }
  if (language) and.push({ language: { equals: language } })
  if (level) and.push({ level: { equals: level } })

  const { docs } = await (await payload()).find({
    collection: 'courses',
    where: { and },
    sort: '-createdAt',
    depth: 1,
    ...(limit ? { limit } : { pagination: false }),
  })
  return docs
}

export type OutlineLesson = Pick<Lesson, 'id' | 'title' | 'slug' | 'summary' | 'isFree'> & {
  duration: number | null
  locked: boolean
}
export type OutlineModule = Pick<Module, 'id' | 'title' | 'summary'> & { lessons: OutlineLesson[] }
export type CourseWithOutline = {
  course: Course
  modules: OutlineModule[]
  lessons: OutlineLesson[]
}

/** A published course with its modules and published lessons, in order. */
export const getCourseBySlug = cache(
  async (slug: string, learner: Learner = null): Promise<CourseWithOutline | null> => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'courses',
      where: { and: [published, { slug: { equals: slug } }] },
      depth: 2,
      limit: 1,
    })
    const course = docs[0]
    if (!course) return null

    const [{ docs: modules }, { docs: lessons }] = await Promise.all([
      p.find({
        collection: 'modules',
        where: { course: { equals: course.id } },
        sort: '_order',
        depth: 0,
        limit: 200,
      }),
      p.find({
        collection: 'lessons',
        where: { and: [published, { course: { equals: course.id } }] },
        sort: '_order',
        depth: 1,
        limit: 1000,
        overrideAccess: true,
        select: { title: true, slug: true, summary: true, isFree: true, module: true, video: true },
      }),
    ])

    const toOutline = (l: (typeof lessons)[number]): OutlineLesson => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      summary: l.summary,
      isFree: l.isFree,
      duration: typeof l.video === 'object' && l.video ? (l.video as MuxVideo).duration ?? null : null,
      locked: !canAccessLesson({ lesson: l, course, learner }),
    })

    const outline: OutlineModule[] = modules.map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      lessons: lessons
        .filter((l) => (typeof l.module === 'object' ? l.module?.id : l.module) === m.id)
        .map(toOutline),
    }))

    return {
      course,
      modules: outline.filter((m) => m.lessons.length > 0),
      lessons: outline.flatMap((m) => m.lessons),
    }
  },
)

export type LessonPageData = {
  course: Course
  outline: CourseWithOutline
  lesson: Lesson
  video: MuxVideo | null
  locked: boolean
  prev: OutlineLesson | null
  next: OutlineLesson | null
}

/**
 * A published lesson. Body and video are only returned when the learner may see them;
 * otherwise they are stripped here, on the server, and never reach the browser.
 */
export const getLesson = cache(
  async (courseSlug: string, lessonSlug: string, learner: Learner = null) => {
    const outline = await getCourseBySlug(courseSlug, learner)
    if (!outline) return null
    const { course } = outline

    const { docs } = await (await payload()).find({
      collection: 'lessons',
      where: {
        and: [published, { course: { equals: course.id } }, { slug: { equals: lessonSlug } }],
      },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })
    const lesson = docs[0]
    if (!lesson) return null

    const locked = !canAccessLesson({ lesson, course, learner })
    const index = outline.lessons.findIndex((l) => l.id === lesson.id)
    const video = !locked && typeof lesson.video === 'object' ? (lesson.video ?? null) : null

    return {
      course,
      outline,
      lesson: locked ? { ...lesson, body: null, video: null } : lesson,
      video,
      locked,
      prev: index > 0 ? outline.lessons[index - 1] : null,
      next: index >= 0 && index < outline.lessons.length - 1 ? outline.lessons[index + 1] : null,
    } satisfies LessonPageData
  },
)

export async function searchLessons(q: string, limit = 20) {
  const { docs } = await (await payload()).find({
    collection: 'lessons',
    where: {
      and: [
        published,
        // Filter on the course in the query so drafts can't use up the limit.
        { 'course._status': { equals: 'published' } },
        { or: [{ title: { like: q } }, { summary: { like: q } }] },
      ],
    },
    depth: 1,
    limit,
    overrideAccess: true,
    select: { title: true, slug: true, summary: true, isFree: true, course: true },
  })
  // Also narrows `course` to a populated, published Course for callers.
  return docs.filter(
    (l): l is typeof l & { course: Course } =>
      typeof l.course === 'object' && l.course?._status === 'published',
  )
}
