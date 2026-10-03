import Link from 'next/link'

import { Button } from '@/components/Button'
import { signInWithGithub } from '@/app/(frontend)/login/actions'

import { MagicLinkForm } from './MagicLinkForm'
import styles from './AuthCard.module.scss'

/** Shared sign-in / sign-up card: GitHub OAuth plus an email magic link (no passwords). */
export function AuthCard({ mode, next }: { mode: 'login' | 'signup'; next: string }) {
  const isLogin = mode === 'login'
  const nextQs = next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>{isLogin ? '[auth] sign in' : '[auth] create account'}</p>
        <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Start learning'}</h1>
        <p className={styles.lead}>
          {isLogin
            ? 'Pick up where you left off. Your progress syncs across devices.'
            : 'Create a free account to track your progress and unlock free lessons.'}
        </p>

        <form action={signInWithGithub}>
          <input type="hidden" name="next" value={next} />
          <Button type="submit" className={styles.github}>
            Continue with GitHub
          </Button>
        </form>

        <div className={styles.divider}>or use email</div>

        <MagicLinkForm next={next} cta={isLogin ? 'Email me a sign-in link' : 'Email me a sign-up link'} />

        <p className={styles.fine}>No password needed. We email you a one-time link.</p>

        <p className={styles.footer}>
          {isLogin ? (
            <>
              New here? <Link href={`/signup${nextQs}`}>Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link href={`/login${nextQs}`}>Sign in</Link>
            </>
          )}
        </p>
      </section>
    </div>
  )
}
