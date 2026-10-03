import 'server-only'

import { cache } from 'react'

import { getLearner } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

import type { Experience, Goal } from './options'

export type Profile = {
  id: string
  display_name: string | null
  avatar_path: string | null
  bio: string | null
  experience: Experience | null
  goals: Goal[]
  goal_note: string | null
  onboarded_at: string | null
}

const columns = 'id, display_name, avatar_path, bio, experience, goals, goal_note, onboarded_at'

/** The signed-in learner's profile, or null when signed out or not created yet. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const learner = await getLearner()
  if (!learner) return null
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select(columns).eq('id', learner.id).maybeSingle()
  return (data as Profile | null) ?? null
})

/** Where to send someone right after they sign in or confirm their email. */
export async function landingAfterSignIn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  next: string,
): Promise<string> {
  const { data } = await supabase.from('profiles').select('onboarded_at').eq('id', userId).maybeSingle()
  if (data?.onboarded_at) return next
  return `/onboarding?next=${encodeURIComponent(next)}`
}
