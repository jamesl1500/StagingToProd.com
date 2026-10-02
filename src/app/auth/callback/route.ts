import { NextResponse, type NextRequest } from 'next/server'

import { safeNext } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

/** OAuth (GitHub) and magic-link sign-ins land here with a PKCE `code`. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const flowId = searchParams.get('sb_flow_id')
  const next = safeNext(searchParams.get('next'))

  if (code && isSupabaseConfigured) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=callback`)
}
