import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { siteUrl } from '@/lib/format'

// Built from the CMS on each request so new courses show up without a deploy.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })
  const published = { _status: { equals: 'published' } }

  const [{ docs: courses }, { docs: lessons }] = await Promise.all([
    payload.find({
      collection: 'courses',
      where: published,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'lessons',
      where: published,
      depth: 0,
      limit: 5000,
      pagination: false,
      overrideAccess: true,
      select: { slug: true, course: true, updatedAt: true },
    }),
  ])

  const courseSlug = new Map(courses.map((c) => [c.id, c.slug]))

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: 'weekly', priority: 0.9 },
    ...courses.map((c) => ({
      url: `${siteUrl}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...lessons.flatMap((l) => {
      const courseId = l.course && typeof l.course === 'object' ? l.course.id : l.course
      const slug = courseId ? courseSlug.get(courseId) : undefined
      return slug
        ? [{ url: `${siteUrl}/courses/${slug}/${l.slug}`, lastModified: l.updatedAt, priority: 0.6 }]
        : []
    }),
  ]
}
