import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

import { safeNext } from '@/lib/supabase/auth'
import { landingAfterSignIn } from '@/lib/profile'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Email links that use `{{ .TokenHash }}` in the Supabase email template land here
 * (sign-up confirmation, magic link, email change).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  if (tokenHash && type && isSupabaseConfigured) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error && data.user) {
      return NextResponse.redirect(`${origin}${await landingAfterSignIn(supabase, data.user.id, next)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=confirm`)
}
