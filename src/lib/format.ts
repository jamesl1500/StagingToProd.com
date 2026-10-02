import type { Course } from '@/payload-types'

export const languageLabels: Record<Course['language'], string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  sql: 'SQL',
  general: 'Career',
}

export const levelLabels: Record<Course['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/** "[01]" style index used across the site. */
export const pad = (n: number) => `[${String(n).padStart(2, '0')}]`

/** 754 seconds -> "12:34" */
export function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = h ? String(m).padStart(2, '0') : String(m)
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

export const siteUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
