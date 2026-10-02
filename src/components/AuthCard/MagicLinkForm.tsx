'use client'

import { useActionState } from 'react'

import { Button } from '@/components/Button'
import { sendMagicLink, type MagicLinkState } from '@/app/(frontend)/login/actions'

import styles from './AuthCard.module.scss'

export function MagicLinkForm({ next, cta }: { next: string; cta: string }) {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(sendMagicLink, { status: 'idle' })

  if (state.status === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <span>&gt; Check your inbox.</span>
        <span>
          We sent a sign-in link to <strong>{state.email}</strong>. It expires in one hour.
        </span>
      </div>
    )
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="email" className={styles.label}>
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        defaultValue={state.email}
        className={styles.input}
        aria-invalid={state.status === 'error'}
        aria-describedby={state.status === 'error' ? 'email-error' : undefined}
      />
      {state.status === 'error' && (
        <p id="email-error" className={styles.error} role="alert">
          {state.message}
        </p>
      )}
      <Button type="submit" className={styles.submit} disabled={pending}>
        {pending ? 'Sending...' : cta}
      </Button>
    </form>
  )
}
