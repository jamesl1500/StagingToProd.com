import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

export const Modules: CollectionConfig = {
  slug: 'modules',
  orderable: true,
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'course'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
    },
    { name: 'summary', type: 'textarea' },
    {
      name: 'lessons',
      type: 'join',
      collection: 'lessons',
      on: 'module',
      defaultSort: '_order',
      admin: { defaultColumns: ['title', 'isFree', '_status'] },
    },
  ],
}
