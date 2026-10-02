import type { TextField } from 'payload'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** URL slug that fills itself from the title when left empty. */
export const slugField = (
  sourceField = 'title',
  { unique = false }: { unique?: boolean } = {},
): TextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique,
  required: true,
  admin: {
    position: 'sidebar',
    description: 'Used in the URL. Leave empty to generate it from the title.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[sourceField]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
