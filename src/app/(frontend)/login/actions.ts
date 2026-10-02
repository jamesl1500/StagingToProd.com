'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { siteUrl } from '@/lib/format'
import { safeNext } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

export type MagicLinkState = { status: 'idle' | 'sent' | 'error'; message?: string; email?: string }

const notConfigured = 'Sign-in is not configured yet. Add the Supabase keys to the environment.'

async function callbackUrl(next: string) {
  const origin = (await headers()).get('origin') ?? siteUrl
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`
}

export async function signInWithGithub(formData: FormData) {
  const next = safeNext(formData.get('next')?.toString())
  if (!isSupabaseConfigured) redirect(`/auth/error?reason=config`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: await callbackUrl(next) },
  })
  if (error || !data.url) redirect(`/auth/error?reason=oauth`)
  redirect(data.url)
}

export async function sendMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const next = safeNext(formData.get('next')?.toString())

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Enter a valid email address.', email }
  }
  if (!isSupabaseConfigured) return { status: 'error', message: notConfigured, email }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: await callbackUrl(next), shouldCreateUser: true },
  })

  if (error) {
    return {
      status: 'error',
      message: error.status === 429 ? 'Too many attempts. Wait a minute and try again.' : 'Could not send the link. Try again.',
      email,
    }
  }
  return { status: 'sent', email }
}
