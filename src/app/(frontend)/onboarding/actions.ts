'use server'

import { redirect } from 'next/navigation'

import { AVATAR_BUCKET, isOwnAvatarPath } from '@/lib/profile/avatar'
import { isExperience, isGoal, limits } from '@/lib/profile/options'
import { getLearner, safeNext } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

export type StepState = {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'display_name' | 'avatar_path' | 'bio' | 'experience' | 'goals' | 'goal_note', string>>
}

const text = (formData: FormData, key: string) => formData.get(key)?.toString().trim() ?? ''

async function requireLearner() {
  const learner = await getLearner()
  if (!learner) redirect('/login?next=/onboarding')
  return learner
}

/** Step 1: name, avatar and bio. */
export async function saveProfile(_prev: StepState, formData: FormData): Promise<StepState> {
  const learner = await requireLearner()
  const next = safeNext(text(formData, 'next'), '/courses')
  const displayName = text(formData, 'display_name')
  const bio = text(formData, 'bio')
  const avatarPath = text(formData, 'avatar_path')

  const fieldErrors: StepState['fieldErrors'] = {}
  if (!displayName) fieldErrors.display_name = 'Add the name you want other learners to see.'
  else if (displayName.length > limits.displayName) fieldErrors.display_name = `Keep it under ${limits.displayName} characters.`
  if (bio.length > limits.bio) fieldErrors.bio = `Keep your bio under ${limits.bio} characters.`
  if (avatarPath && !isOwnAvatarPath(avatarPath, learner.id)) fieldErrors.avatar_path = 'That upload did not work. Try the photo again.'
  if (Object.keys(fieldErrors).length) return { status: 'error', fieldErrors }

  const supabase = await createClient()
  const { data: previous } = await supabase.from('profiles').select('avatar_path').eq('id', learner.id).maybeSingle()

  const { error } = await supabase.from('profiles').upsert({
    id: learner.id,
    display_name: displayName,
    bio: bio || null,
    avatar_path: avatarPath || null,
  })
  if (error) return { status: 'error', message: 'Could not save your profile. Try again.' }

  // Tidy up the old file when the avatar changed or was removed. Failure here is harmless.
  const oldPath = previous?.avatar_path
  if (oldPath && oldPath !== avatarPath && isOwnAvatarPath(oldPath, learner.id)) {
    await supabase.storage.from(AVATAR_BUCKET).remove([oldPath])
  }

  redirect(`/onboarding?step=goals&next=${encodeURIComponent(next)}`)
}

/** Step 2: goals and experience. Finishing this step completes onboarding. */
export async function saveGoals(_prev: StepState, formData: FormData): Promise<StepState> {
  const learner = await requireLearner()
  const next = safeNext(text(formData, 'next'), '/courses')
  const experience = text(formData, 'experience')
  const goals = [...new Set(formData.getAll('goals').map(String))]
  const goalNote = text(formData, 'goal_note')

  const fieldErrors: StepState['fieldErrors'] = {}
  if (!isExperience(experience)) fieldErrors.experience = 'Pick the option closest to where you are now.'
  if (goals.length === 0) fieldErrors.goals = 'Pick at least one goal.'
  else if (!goals.every(isGoal)) fieldErrors.goals = 'Pick goals from the list.'
  if (goalNote.length > limits.goalNote) fieldErrors.goal_note = `Keep it under ${limits.goalNote} characters.`
  if (Object.keys(fieldErrors).length) return { status: 'error', fieldErrors }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('profiles')
    .select('display_name, onboarded_at')
    .eq('id', learner.id)
    .maybeSingle()
  // Step 1 creates the row; without it there is no name to show, so go back there.
  if (!existing?.display_name) redirect(`/onboarding?next=${encodeURIComponent(next)}`)

  const { error } = await supabase
    .from('profiles')
    .update({
      experience,
      goals,
      goal_note: goalNote || null,
      onboarded_at: existing.onboarded_at ?? new Date().toISOString(),
    })
    .eq('id', learner.id)
  if (error) return { status: 'error', message: 'Could not save your goals. Try again.' }

  // Editing later skips the welcome screen and goes straight back.
  if (existing.onboarded_at) redirect(next)
  redirect(`/onboarding?step=done&next=${encodeURIComponent(next)}`)
}
