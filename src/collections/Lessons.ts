import { ValidationError, type CollectionConfig } from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { adminsOrFreeLesson, adminsOrPublished, isAdmin } from '@/access'
import { Callout } from '@/blocks/Callout'
import { Code } from '@/blocks/Code'
import { slugField } from '@/fields/slug'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  orderable: true,
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'module', 'isFree', '_status'],
  },
  access: {
    read: adminsOrPublished,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      required: true,
      index: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically from the module.',
      },
    },
    {
      name: 'isFree',
      type: 'checkbox',
      label: 'Free preview',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Free lessons are open to everyone, even on paid courses.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'Shown in the course outline.' },
    },
    {
      name: 'video',
      type: 'relationship',
      relationTo: 'mux-video',
      access: { read: adminsOrFreeLesson },
    },
    {
      name: 'body',
      type: 'richText',
      access: { read: adminsOrFreeLesson },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [Code, Callout] }),
        ],
      }),
    },
  ],
  hooks: {
    beforeChange: [
      // Keep `course` in sync with the lesson's module so lessons can be queried by course.
      async ({ data, req }) => {
        const moduleId = typeof data.module === 'object' ? data.module?.id : data.module
        if (!moduleId) return data
        const mod = await req.payload.findByID({
          collection: 'modules',
          id: moduleId,
          depth: 0,
          req,
        })
        return { ...data, course: mod.course }
      },
    ],
    beforeValidate: [
      // Lesson slugs must be unique within a course.
      async ({ data, req, originalDoc }) => {
        if (!data?.slug || !data?.module) return data
        const moduleId = typeof data.module === 'object' ? data.module.id : data.module
        const mod = await req.payload.findByID({
          collection: 'modules',
          id: moduleId,
          depth: 0,
          req,
        })
        const clash = await req.payload.find({
          collection: 'lessons',
          where: {
            and: [
              { course: { equals: mod.course } },
              { slug: { equals: data.slug } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          draft: true,
          req,
        })
        if (clash.totalDocs > 0) {
          throw new ValidationError({
            collection: 'lessons',
            errors: [
              {
                path: 'slug',
                message: `Another lesson in this course already uses the slug "${data.slug}".`,
              },
            ],
          })
        }
        return data
      },
    ],
  },
}
