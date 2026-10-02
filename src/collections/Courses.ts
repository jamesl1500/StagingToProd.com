import type { CollectionConfig } from 'payload'

import { adminsOrPublished, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'language', 'level', 'priceMode', '_status'],
  },
  access: {
    read: adminsOrPublished,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title', { unique: true }),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences shown on the course card.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'richText' },
    {
      type: 'row',
      fields: [
        {
          name: 'language',
          type: 'select',
          required: true,
          defaultValue: 'javascript',
          options: [
            { label: 'JavaScript', value: 'javascript' },
            { label: 'TypeScript', value: 'typescript' },
            { label: 'Python', value: 'python' },
            { label: 'Go', value: 'go' },
            { label: 'Rust', value: 'rust' },
            { label: 'Java', value: 'java' },
            { label: 'C#', value: 'csharp' },
            { label: 'SQL', value: 'sql' },
            { label: 'Career / general', value: 'general' },
          ],
        },
        {
          name: 'level',
          type: 'select',
          required: true,
          defaultValue: 'beginner',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ],
        },
      ],
    },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'author', type: 'relationship', relationTo: 'authors' },
    {
      name: 'modules',
      type: 'join',
      collection: 'modules',
      on: 'course',
      defaultSort: '_order',
      admin: { defaultColumns: ['title'] },
    },
    {
      name: 'priceMode',
      type: 'select',
      required: true,
      defaultValue: 'free',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Free', value: 'free' },
        { label: 'One-time purchase', value: 'one-time' },
        { label: 'Included in subscription', value: 'subscription' },
      ],
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Stripe Price ID for one-time purchases (used in the payments milestone).',
        condition: (data) => data?.priceMode === 'one-time',
      },
    },
  ],
}
