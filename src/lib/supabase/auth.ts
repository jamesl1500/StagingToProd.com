import 'server-only'

import { cache } from 'react'

import { isSupabaseConfigured } from './env'
import { createClient } from './server'

export type SignedInLearner = {
  id: string
  email: string | null
  provider: string | null
}

/**
 * The signed-in learner for this request, or null.
 * Uses getClaims(), which verifies the JWT locally; call supabase.auth.getUser()
 * instead for sensitive actions that must confirm the session server-side.
 */
export const getLearner = cache(async (): Promise<SignedInLearner | null> => {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null
  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    provider: (claims.app_metadata as { provider?: string } | undefined)?.provider ?? null,
  }
})

export { safeNext } from '@/lib/safe-next'
