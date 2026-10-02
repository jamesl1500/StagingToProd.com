'use client'

import { useActionState, useState } from 'react'

import { saveProfile, type StepState } from '@/app/(frontend)/onboarding/actions'
import { Button } from '@/components/Button'
import { limits } from '@/lib/profile/options'

import { AvatarUpload } from './AvatarUpload'
import styles from './Onboarding.module.scss'

export function ProfileStep({
  userId,
  next,
  defaults,
}: {
  userId: string
  next: string
  defaults: { displayName: string; bio: string; avatarPath: string | null }
}) {
  const [state, action, pending] = useActionState<StepState, FormData>(saveProfile, { status: 'idle' })
  const [name, setName] = useState(defaults.displayName)
  const [bio, setBio] = useState(defaults.bio)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />

      <AvatarUpload userId={userId} initialPath={defaults.avatarPath} name={name} error={errors.avatar_path} />

      <div className={styles.field}>
        <label htmlFor="display_name" className={styles.label}>
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={limits.displayName}
          autoComplete="nickname"
          required
          aria-invalid={!!errors.display_name}
          aria-describedby={errors.display_name ? 'display_name-error' : undefined}
        />
        {errors.display_name && (
          <p id="display_name-error" className={styles.fieldError}>
            {errors.display_name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="bio" className={styles.label}>
            Bio <span className={styles.optional}>optional</span>
          </label>
          <span className={styles.counter} aria-live="polite">
            {bio.length}/{limits.bio}
          </span>
        </div>
        <textarea
          id="bio"
          name="bio"
          className={styles.textarea}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={limits.bio}
          placeholder="Self-taught, learning TypeScript after work. Into music and building tools."
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
        />
        {errors.bio && (
          <p id="bio-error" className={styles.fieldError}>
            {errors.bio}
          </p>
        )}
      </div>

      {state.message && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  )
}
