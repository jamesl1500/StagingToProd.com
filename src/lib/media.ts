import type { Media } from '@/payload-types'

export const mediaUrl = (m: number | Media | null | undefined) =>
  m && typeof m === 'object' ? (m.url ?? null) : null
