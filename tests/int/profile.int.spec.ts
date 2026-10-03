import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { isOwnAvatarPath } from '@/lib/profile/avatar'
import { experienceOptions, goalOptions } from '@/lib/profile/options'

const migration = readFileSync(
  join(process.cwd(), 'supabase/migrations/20261002213825_learner_profiles.sql'),
  'utf8',
)
const uid = '0b9f6a52-6f0e-4a8e-9d43-6a3d3c2a4f11'

describe('isOwnAvatarPath', () => {
  it('accepts a file in the learner folder', () => {
    expect(isOwnAvatarPath(`${uid}/avatar-1696262400.webp`, uid)).toBe(true)
  })

  it.each([
    'someone-else/avatar.webp',
    `${uid}/../other/avatar.webp`,
    `${uid}/nested/avatar.webp`,
    `${uid}/`,
    `${uid}/.hidden`,
    'avatar.webp',
  ])('rejects %s', (path) => {
    expect(isOwnAvatarPath(path, uid)).toBe(false)
  })
})

describe('profile options match the database constraints', () => {
  it.each(goalOptions.map((g) => g.value))('goal %s is allowed by the migration', (goal) => {
    expect(migration).toContain(`'${goal}'`)
  })

  it.each(experienceOptions.map((e) => e.value))('experience %s is allowed by the migration', (value) => {
    expect(migration).toContain(`'${value}'`)
  })
})
