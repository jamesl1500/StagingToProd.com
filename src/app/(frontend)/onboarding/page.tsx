import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { GoalsStep } from '@/components/Onboarding/GoalsStep'
import styles from '@/components/Onboarding/Onboarding.module.scss'
import { ProfileStep } from '@/components/Onboarding/ProfileStep'
import { firstParam, type SearchParams } from '@/lib/params'
import { getProfile } from '@/lib/profile'
import { avatarUrl } from '@/lib/profile/avatar'
import { experienceLabel, goalLabel } from '@/lib/profile/options'
import { getLearner, safeNext } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Set up your profile', robots: { index: false } }

const steps = [
  { key: 'profile', label: 'Profile' },
  { key: 'goals', label: 'Goals' },
  { key: 'done', label: 'Ready' },
] as const
type Step = (typeof steps)[number]['key']

const copy: Record<Step, { title: string; lead: string; editTitle?: string }> = {
  profile: {
    title: 'Set up your profile',
    editTitle: 'Edit your profile',
    lead: 'Add a photo and a few words about you. This is what other learners see next to your name.',
  },
  goals: {
    title: 'What are you aiming for?',
    editTitle: 'Edit your goals',
    lead: 'We use this to suggest where to start and what to take next. You can change it any time.',
  },
  done: { title: 'You are in.', lead: 'Your profile is set. Time to write some code.' },
}

export default async function OnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const nextParam = safeNext(firstParam(sp.next), '/courses')
  // Never bounce back into onboarding once it is finished.
  const next = nextParam.startsWith('/onboarding') ? '/courses' : nextParam
  const requested = firstParam(sp.step)
  const self = (step: Step) => `/onboarding?step=${step}&next=${encodeURIComponent(next)}`

  const learner = await getLearner()
  if (!learner) redirect(`/login?next=${encodeURIComponent(next)}`)

  const profile = await getProfile()
  const editing = Boolean(profile?.onboarded_at)

  // Goals and the welcome screen need a saved name first.
  let step: Step = steps.some((s) => s.key === requested) ? (requested as Step) : 'profile'
  if (step !== 'profile' && !profile?.display_name) step = 'profile'
  if (step === 'done' && !editing) step = 'goals'

  const index = steps.findIndex((s) => s.key === step)
  const { title, editTitle, lead } = copy[step]

  return (
    <Container>
      <div className={styles.layout}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            {editing && step !== 'done'
              ? '[me] edit profile'
              : `[${String(index + 1).padStart(2, '0')}/${String(steps.length).padStart(2, '0')}] onboarding`}
          </p>
          <h1 className={styles.title}>{editing && editTitle ? editTitle : title}</h1>
          <p className={styles.lead}>{lead}</p>
          {!(editing && step !== 'done') && (
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li
                  key={s.key}
                  className={`${styles.step} ${i < index ? styles.stepDone : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                >
                  <span>[{String(i + 1).padStart(2, '0')}]</span>
                  <span>{s.label}</span>
                  {i < index && <span className={styles.stepMark}>ok</span>}
                </li>
              ))}
            </ol>
          )}
        </header>

        <section className={styles.panel}>
          {step === 'profile' && (
            <ProfileStep
              userId={learner.id}
              next={next}
              submitLabel={editing ? 'Save' : 'Continue'}
              defaults={{
                displayName: profile?.display_name ?? learner.name ?? learner.email?.split('@')[0] ?? '',
                bio: profile?.bio ?? '',
                avatarPath: profile?.avatar_path ?? null,
              }}
            />
          )}

          {step === 'goals' && (
            <GoalsStep
              next={next}
              backHref={self('profile')}
              submitLabel={editing ? 'Save' : 'Finish'}
              defaults={{
                experience: profile?.experience ?? null,
                goals: profile?.goals ?? [],
                goalNote: profile?.goal_note ?? '',
              }}
            />
          )}

          {step === 'done' && profile && (
            <div className={styles.done}>
              <div className={styles.who}>
                <Avatar src={avatarUrl(profile.avatar_path)} name={profile.display_name} size="lg" />
                <div>
                  <p className={styles.whoName}>{profile.display_name}</p>
                  {profile.bio && <p className={styles.whoBio}>{profile.bio}</p>}
                </div>
              </div>
              <div className={styles.chips}>
                {experienceLabel(profile.experience) && <Badge variant="solid">{experienceLabel(profile.experience)}</Badge>}
                {profile.goals.map((g) => (
                  <Badge key={g}>{goalLabel(g)}</Badge>
                ))}
              </div>
              <pre className={styles.log} aria-hidden="true">
                {`$ deploy profile --env=prod\n> build ok\n> tests ok\n> live`}
              </pre>
              <div className={styles.actions}>
                <Button href="/account" variant="outline">
                  View account
                </Button>
                <Button href={next}>{next === '/courses' ? 'Browse courses' : 'Continue'} -&gt;</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Container>
  )
}
