import { getPayload, Payload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@/payload.config'
import type { Lesson } from '@/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { canAccessLesson } from '@/lib/access'
import { getCourseBySlug, getLesson, searchLessons } from '@/lib/content'
import { safeNext } from '@/lib/safe-next'

describe('safeNext', () => {
  it('keeps same-site paths', () => {
    expect(safeNext('/courses/ts/generics?x=1')).toBe('/courses/ts/generics?x=1')
  })

  it('normalizes dot segments but stays on the site', () => {
    expect(safeNext('/a/../courses')).toBe('/courses')
  })

  it.each([
    null,
    undefined,
    '',
    ['/a', '/b'],
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    'javascript:alert(1)',
  ])(
    'falls back for %s',
    (next) => {
      expect(safeNext(next)).toBe('/account')
    },
  )
})

describe('canAccessLesson', () => {
  it('opens free previews and free courses only', () => {
    expect(canAccessLesson({ lesson: { isFree: true }, course: { priceMode: 'one-time' } })).toBe(true)
    expect(canAccessLesson({ lesson: { isFree: false }, course: { priceMode: 'free' } })).toBe(true)
    expect(canAccessLesson({ lesson: { isFree: false }, course: { priceMode: 'one-time' } })).toBe(false)
  })
})

let payload: Payload
const created: { courseId?: number; draftCourseId?: number } = {}
const slug = 'public-site-test-course'

const body = (text: string): Lesson['body'] => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 }],
      },
    ],
  },
})

describe('public content queries', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const course = await payload.create({
      collection: 'courses',
      data: {
        title: 'Public Site Test Course',
        slug,
        summary: 'Used by the public site integration test.',
        language: 'go',
        level: 'beginner',
        priceMode: 'one-time',
        _status: 'published',
      } as RequiredDataFromCollectionSlug<'courses'>,
    })
    created.courseId = course.id
    const mod = await payload.create({ collection: 'modules', data: { title: 'Basics', course: course.id } })
    const lesson = (d: Record<string, unknown>) =>
      payload.create({
        collection: 'lessons',
        data: { module: mod.id, _status: 'published', ...d } as RequiredDataFromCollectionSlug<'lessons'>,
      })
    await lesson({ title: 'Zebra intro', isFree: true, body: body('free notes') })
    await lesson({ title: 'Zebra deep dive', body: body('paid notes') })
    await lesson({ title: 'Zebra draft', _status: 'draft' })

    // A published lesson inside a draft course must not show up anywhere.
    const draftCourse = await payload.create({
      collection: 'courses',
      data: {
        title: 'Public Site Draft Course',
        slug: `${slug}-draft`,
        summary: 'Draft course for the public site test.',
        language: 'go',
        level: 'beginner',
        priceMode: 'free',
        _status: 'draft',
      } as RequiredDataFromCollectionSlug<'courses'>,
    })
    created.draftCourseId = draftCourse.id
    const draftMod = await payload.create({ collection: 'modules', data: { title: 'Hidden', course: draftCourse.id } })
    await payload.create({
      collection: 'lessons',
      data: { module: draftMod.id, title: 'Zebra hidden', _status: 'published' } as RequiredDataFromCollectionSlug<'lessons'>,
    })
  })

  afterAll(async () => {
    for (const id of [created.courseId, created.draftCourseId]) {
      if (!id) continue
      await payload.delete({ collection: 'lessons', where: { course: { equals: id } } })
      await payload.delete({ collection: 'modules', where: { course: { equals: id } } })
      await payload.delete({ collection: 'courses', id })
    }
  })

  it('builds the outline from published lessons, in order, with locks', async () => {
    const data = await getCourseBySlug(slug)
    expect(data?.modules).toHaveLength(1)
    expect(data?.lessons.map((l) => [l.slug, l.locked])).toEqual([
      ['zebra-intro', false],
      ['zebra-deep-dive', true],
    ])
  })

  it('serves the body of a free preview', async () => {
    const data = await getLesson(slug, 'zebra-intro')
    expect(data?.locked).toBe(false)
    expect(JSON.stringify(data?.lesson.body)).toContain('free notes')
    expect(data?.next?.slug).toBe('zebra-deep-dive')
  })

  it('strips the body of a locked lesson', async () => {
    const data = await getLesson(slug, 'zebra-deep-dive')
    expect(data?.locked).toBe(true)
    expect(data?.lesson.body).toBeFalsy()
    expect(JSON.stringify(data)).not.toContain('paid notes')
    expect(data?.prev?.slug).toBe('zebra-intro')
  })

  it('does not find drafts or lessons in draft courses', async () => {
    expect(await getLesson(slug, 'zebra-draft')).toBeNull()
    expect(await getCourseBySlug(`${slug}-draft`)).toBeNull()
    // limit 2: the draft course's lesson must not take one of the slots.
    const results = await searchLessons('Zebra', 2)
    expect(results.map((l) => l.slug).sort()).toEqual(['zebra-deep-dive', 'zebra-intro'])
  })
})
