import 'server-only'

import { cache } from 'react'

import { isSupabaseConfigured } from './env'
import { createClient } from './server'

export type SignedInLearner = {
  id: string
  email: string | null
  provider: string | null
  /** Name from the sign-in provider (e.g. GitHub). Display only: users can edit it, so never use it for access checks. */
  name: string | null
}

/**
 * The signed-in learner for this request, or null.
 * Uses getClaims(), which verifies the JWT locally; call supabase.auth.getUser()
 * instead for sensitive actions that must confirm the session server-side.
 */
function metadataName(meta: unknown): string | null {
  const m = (meta ?? {}) as Record<string, unknown>
  const name = [m.full_name, m.name, m.user_name].find((v) => typeof v === 'string' && v.trim())
  return typeof name === 'string' ? name.trim().slice(0, 60) : null
}

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
    name: metadataName(claims.user_metadata),
  }
})

export { safeNext } from '@/lib/safe-next'
