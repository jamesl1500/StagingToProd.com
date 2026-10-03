import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/Badge'
import { PageHeader } from '@/components/PageHeader'
import { getProfile } from '@/lib/profile'
import { avatarUrl } from '@/lib/profile/avatar'
import { experienceLabel, goalLabel } from '@/lib/profile/options'
import { getLearner } from '@/lib/supabase/auth'

import styles from './page.module.scss'

// Never cache: this page depends on the signed-in session.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Your account', robots: { index: false } }

export default async function AccountPage() {
  const learner = await getLearner()
  if (!learner) redirect('/login?next=/account')
  const profile = await getProfile()
  if (!profile?.onboarded_at) redirect('/onboarding?next=/account')
  const edit = (step: string) => `/onboarding?step=${step}&next=/account`

  return (
    <Container>
      <PageHeader eyebrow="[me] account" title="Your account" lead="Your profile, courses and settings." />

      <section className={styles.profile} aria-labelledby="profile-title">
        <Avatar src={avatarUrl(profile.avatar_path)} name={profile.display_name} size="lg" />
        <div className={styles.profileBody}>
          <h2 id="profile-title" className={styles.name}>
            {profile.display_name}
          </h2>
          {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : <p className={styles.empty}>&gt; No bio yet.</p>}
          <div className={styles.chips}>
            {experienceLabel(profile.experience) && <Badge variant="solid">{experienceLabel(profile.experience)}</Badge>}
            {profile.goals.map((g) => (
              <Badge key={g}>{goalLabel(g)}</Badge>
            ))}
          </div>
          {profile.goal_note && <p className={styles.note}>&quot;{profile.goal_note}&quot;</p>}
        </div>
        <div className={styles.profileActions}>
          <Button href={edit('profile')} variant="outline">
            Edit profile
          </Button>
          <Button href={edit('goals')} variant="ghost">
            Edit goals
          </Button>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.box}>
          <h2 className={styles.boxTitle}>My courses</h2>
          <p className={styles.empty}>&gt; Course progress shows up here once you start a lesson.</p>
          <Button href="/courses" variant="outline">
            Browse courses
          </Button>
        </section>

        <section className={styles.box}>
          <h2 className={styles.boxTitle}>Sign-in</h2>
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
