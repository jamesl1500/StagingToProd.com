import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { getLearner } from '@/lib/supabase/auth'

import styles from './page.module.scss'

// Never cache: this page depends on the signed-in session.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Your account', robots: { index: false } }

export default async function AccountPage() {
  const learner = await getLearner()
  if (!learner) redirect('/login?next=/account')

  return (
    <Container>
      <PageHeader eyebrow="[me] account" title="Your account" lead="Your courses, progress and settings." />

      <div className={styles.grid}>
        <section className={styles.box}>
          <h2 className={styles.boxTitle}>My courses</h2>
          <p className={styles.empty}>&gt; Course progress shows up here once you start a lesson.</p>
          <Button href="/courses" variant="outline">
            Browse courses
          </Button>
        </section>

        <section className={styles.box}>
          <h2 className={styles.boxTitle}>Profile</h2>
          <dl className={styles.rows}>
            <div>
              <dt>Email</dt>
              <dd>{learner.email ?? '--'}</dd>
            </div>
            <div>
              <dt>Signed in with</dt>
              <dd>{learner.provider === 'github' ? 'GitHub' : 'Email link'}</dd>
            </div>
          </dl>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </section>
      </div>
    </Container>
  )
}
