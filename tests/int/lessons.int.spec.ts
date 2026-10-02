import { getPayload, Payload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@/payload.config'
import type { Lesson } from '@/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const created: { courseId?: number; moduleId?: number } = {}

// Slugs are left out on purpose: the slug field fills itself from the title.
const courseData = (d: Record<string, unknown>) => d as RequiredDataFromCollectionSlug<'courses'>
const lessonData = (d: Record<string, unknown>) => d as RequiredDataFromCollectionSlug<'lessons'>

const body: Lesson['body'] = {
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
        children: [{ type: 'text', version: 1, text: 'Lesson content', format: 0, style: '', mode: 'normal', detail: 0 }],
      },
    ],
  },
}

describe('Lessons', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const course = await payload.create({
      collection: 'courses',
      data: courseData({
        title: 'Access Test Course',
        summary: 'Used by the lessons integration test.',
        language: 'typescript',
        level: 'beginner',
        priceMode: 'one-time',
        _status: 'published',
      }),
    })
    created.courseId = course.id
    const mod = await payload.create({
      collection: 'modules',
      data: { title: 'Module', course: course.id },
    })
    created.moduleId = mod.id
  })

  afterAll(async () => {
    if (created.courseId) {
      await payload.delete({ collection: 'lessons', where: { course: { equals: created.courseId } } })
      await payload.delete({ collection: 'modules', where: { course: { equals: created.courseId } } })
      await payload.delete({ collection: 'courses', id: created.courseId })
    }
  })

  it('fills slug and course automatically', async () => {
    const lesson = await payload.create({
      collection: 'lessons',
      data: lessonData({ title: 'Hello World!', module: created.moduleId!, _status: 'published' }),
    })
    expect(lesson.slug).toBe('hello-world')
    const courseId = typeof lesson.course === 'object' ? lesson.course?.id : lesson.course
    expect(courseId).toBe(created.courseId)
  })

  it('rejects a duplicate slug in the same course', async () => {
    await expect(
      payload.create({
        collection: 'lessons',
        data: lessonData({ title: 'Hello world', module: created.moduleId!, _status: 'published' }),
      }),
    ).rejects.toThrow()
  })

  it('hides the body of paid lessons from the public API', async () => {
    await payload.create({
      collection: 'lessons',
      data: lessonData({ title: 'Paid', module: created.moduleId!, body, _status: 'published' }),
    })
    await payload.create({
      collection: 'lessons',
      data: lessonData({ title: 'Free', module: created.moduleId!, body, isFree: true, _status: 'published' }),
    })

    const { docs } = await payload.find({
      collection: 'lessons',
      where: { course: { equals: created.courseId } },
      overrideAccess: false,
      depth: 0,
    })

    const paid = docs.find((d) => d.slug === 'paid')
    const free = docs.find((d) => d.slug === 'free')
    expect(paid?.body).toBeUndefined()
    expect(free?.body).toBeDefined()
  })
})
